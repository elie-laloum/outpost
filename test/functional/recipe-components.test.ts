import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import {
  createRecipeRuntime,
  validateRecipeProject,
} from "../../src/recipes.ts";
import { readRecipeProject } from "../../src/application/recipes/project.ts";
import { createRecipeComponentScope } from "../../src/application/recipes/scope.ts";
import {
  createAgent,
  createClaudeHarness,
  defineAgentProfile,
} from "../../src/index.ts";
import { nativeRecipeGuards } from "../../src/application/recipes/native.ts";
import type { CliAgent } from "../../src/domain/agent.types.ts";
import { repository } from "../helpers.ts";

function isCliAgent(value: unknown): value is CliAgent {
  return (
    nativeRecipeGuards.agent!(value) &&
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    value.kind === "cli"
  );
}

test("native workspace copies retain repository-relative paths", async (t) => {
  const directory = await repository(t);
  const git = (...args: string[]) =>
    promisify(execFile)("git", args, { cwd: directory });
  await writeFile(join(directory, ".gitignore"), "ignored.txt\n");
  await git("add", ".gitignore");
  await git("commit", "-m", "Ignore local fixture");
  await writeFile(join(directory, "ignored.txt"), "copied fixture");
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "copies",
      tasks: [
        {
          key: "read",
          command: {
            executable: process.execPath,
            arguments: [
              "-e",
              "console.log(require('fs').readFileSync('ignored.txt', 'utf8'))",
            ],
          },
        },
      ],
    }),
  );
  await writeFile(
    config,
    JSON.stringify({
      version: 2,
      repository: ".",
      sandbox: { provider: "local" },
      branch: { mode: "integrate" },
      workspace: { copies: ["ignored.txt"] },
    }),
  );
  await using runtime = await createRecipeRuntime({ file, config });
  const result = await runtime.run();
  assert.equal(result.status, "done", JSON.stringify(result.errors));
  assert.equal(result.outputs.read?.stdout, "copied fixture\n");
  assert.equal(
    await readFile(join(directory, "ignored.txt"), "utf8"),
    "copied fixture",
  );
});

test("missing explicitly selected agent credentials fail before repository allocation", async (t) => {
  const directory = await mkdtemp(
    join(tmpdir(), "outpost-recipe-credentials-"),
  );
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "credentials",
      tasks: [{ key: "review", agent: "reviewer", brief: "Review" }],
    }),
  );
  await writeFile(
    config,
    JSON.stringify({
      version: 2,
      repository: "./missing",
      sandbox: { provider: "local" },
      agents: {
        reviewer: {
          harness: "claude",
          authentication: {
            usage: { variable: "OUTPOST_RECIPE_MISSING_CREDENTIAL_FIXTURE" },
          },
        },
      },
    }),
  );
  await validateRecipeProject({ file, config });
  await using runtime = await createRecipeRuntime({ file, config });
  await assert.rejects(
    runtime.run(),
    /Missing OUTPOST_RECIPE_MISSING_CREDENTIAL_FIXTURE/,
  );
});

test("YAML profiles and authentication compose the same CLI requests as TypeScript", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-native-components-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "profile",
      tasks: [{ key: "review", agent: "reviewer", brief: "Review" }],
    }),
  );
  const declaration = {
    version: 2,
    repository: ".",
    sandbox: { provider: "local" },
    profiles: {
      reviewer: {
        type: "portable",
        instructions: "Only review",
        allowedTools: ["read"],
        mcpServers: { docs: { command: "docs-mcp", variables: ["DOCS_KEY"] } },
      },
    },
    agents: {
      reviewer: {
        harness: "claude",
        authentication: { account: { file: "session.json" } },
        model: "sonnet",
        profile: { $ref: "profiles.reviewer" },
      },
    },
  };
  await writeFile(config, JSON.stringify(declaration));
  const project = await readRecipeProject({ file, config });
  const scope = createRecipeComponentScope(
    project.graph,
    project.registry,
    directory,
    new AbortController().signal,
  );
  t.after(() => scope.close());
  const yaml = await scope.resolve("agents.reviewer", "agent");
  assert.ok(isCliAgent(yaml));
  const typescript = createAgent({
    harness: createClaudeHarness({
      authentication: { account: { file: resolve(directory, "session.json") } },
      profile: defineAgentProfile({
        instructions: "Only review",
        allowedTools: ["read"],
        mcpServers: { docs: { command: "docs-mcp", variables: ["DOCS_KEY"] } },
      }),
    }),
    model: "sonnet",
  });
  assert.deepEqual(
    yaml.request({ text: "Review" }),
    typescript.request({ text: "Review" }),
  );
  assert.deepEqual(yaml.credentials?.({}), typescript.credentials?.({}));
  assert.deepEqual(
    yaml.configuration?.({ DOCS_KEY: "fixture" }),
    typescript.configuration?.({ DOCS_KEY: "fixture" }),
  );
  await writeFile(
    config,
    JSON.stringify({
      ...declaration,
      agents: {
        reviewer: {
          ...declaration.agents.reviewer,
          profile: { $ref: "secrets.missing" },
        },
      },
    }),
  );
  await assert.rejects(
    validateRecipeProject({ file, config }),
    /requires profile/,
  );
  await writeFile(
    config,
    JSON.stringify({
      ...declaration,
      sandbox: {
        provider: "docker",
        volumes: [{ source: ".", target: "/project", unknown: true }],
      },
    }),
  );
  await assert.rejects(
    validateRecipeProject({ file, config }),
    /additional properties/,
  );
});

test("YAML secret selections resolve once on the host and are redacted from task results", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-native-secrets-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const git = (...args: string[]) =>
    promisify(execFile)("git", args, { cwd: directory });
  await git("init", "-b", "main");
  await git("config", "user.name", "Recipe");
  await git("config", "user.email", "recipe@example.invalid");
  await writeFile(join(directory, "initial"), "initial");
  await git("add", ".");
  await git("commit", "-m", "initial");
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  const marker = join(directory, "resolved.json");
  await writeFile(
    join(directory, "secrets.mjs"),
    `import {writeFileSync} from 'node:fs'; export const source = { name: 'fixture', async resolve(names) { writeFileSync(${JSON.stringify(marker)}, JSON.stringify(names)); return { SELECTED: 'private-value-42', IGNORED: 'ignored-value' }; } };`,
  );
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "secrets",
      tasks: [
        {
          key: "read",
          command: {
            executable: process.execPath,
            arguments: [
              "-e",
              "if (process.env.IGNORED) process.exit(3); console.log(process.env.SELECTED)",
            ],
          },
        },
      ],
    }),
  );
  const declaration = {
    version: 2,
    repository: ".",
    branch: { mode: "current" },
    sandbox: { provider: "local", variables: { $ref: "variables.selected" } },
    variables: {
      selected: {
        type: "secrets",
        source: { $ref: "extensions.source" },
        names: ["SELECTED"],
      },
    },
    extensions: {
      source: {
        module: "./secrets.mjs",
        export: "source",
        kind: "secretSource",
        version: "1",
      },
    },
    workspace: {
      hooks: {
        sandboxReady: [
          {
            executable: process.execPath,
            arguments: ["-e", "require('fs').writeFileSync('prepared', 'yes')"],
          },
        ],
      },
      limits: { gitMs: 10_000 },
    },
  };
  await writeFile(config, JSON.stringify(declaration));
  await validateRecipeProject({ file, config });
  await assert.rejects(readFile(marker), { code: "ENOENT" });
  await using runtime = await createRecipeRuntime({ file, config });
  const result = await runtime.run();
  assert.equal(result.status, "done", JSON.stringify(result.errors));
  assert.equal(result.outputs.read?.stdout, "[REDACTED]\n");
  assert.deepEqual(JSON.parse(await readFile(marker, "utf8")), ["SELECTED"]);
  assert.equal(await readFile(join(directory, "prepared"), "utf8"), "yes");
  assert.equal(process.env.SELECTED, undefined);
  await writeFile(
    config,
    JSON.stringify({ ...declaration, sandbox: { provider: "firecracker" } }),
  );
  await assert.rejects(
    validateRecipeProject({ file, config }),
    /experimental: true/,
  );
  await writeFile(
    config,
    JSON.stringify({
      ...declaration,
      workspace: { observation: { sinks: [] } },
    }),
  );
  await assert.rejects(
    validateRecipeProject({ file, config }),
    /workspace.observation/,
  );
});

test("extension dependency cycles fail before importing modules", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-extension-cycle-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "cycle",
      tasks: [{ key: "check", command: { executable: "true" } }],
    }),
  );
  const extension = {
    module: "./does-not-exist.mjs",
    export: "create",
    kind: "object",
    version: "1",
    factory: true,
    schema: {
      type: "object",
      properties: { dependency: { type: "object", component: "object" } },
      additionalProperties: false,
    },
  };
  await writeFile(
    config,
    JSON.stringify({
      version: 2,
      repository: ".",
      sandbox: { provider: "local" },
      extensions: {
        first: {
          ...extension,
          options: { dependency: { $ref: "extensions.second" } },
        },
        second: {
          ...extension,
          options: { dependency: { $ref: "extensions.first" } },
        },
      },
    }),
  );
  await assert.rejects(validateRecipeProject({ file, config }), /cycle/);
});

test("extensions resolve installed import-only packages without importing during validation", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-esm-extension-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const entry = join(directory, "node_modules", "fixture-observer");
  await mkdir(entry, { recursive: true });
  await writeFile(
    join(entry, "package.json"),
    JSON.stringify({
      name: "fixture-observer",
      type: "module",
      exports: { import: "./index.js" },
    }),
  );
  await writeFile(
    join(entry, "index.js"),
    "throw new Error('imported fixture'); export const sink = { observe() {} };",
  );
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "extension",
      tasks: [{ key: "check", command: { executable: "true" } }],
    }),
  );
  await writeFile(
    config,
    JSON.stringify({
      version: 2,
      repository: ".",
      sandbox: { provider: "local" },
      extensions: {
        sink: {
          module: "fixture-observer",
          export: "sink",
          kind: "sink",
          version: "1",
        },
      },
      observation: { sinks: [{ $ref: "extensions.sink" }] },
    }),
  );
  await validateRecipeProject({ file, config });
  await using runtime = await createRecipeRuntime({ file, config });
  await assert.rejects(runtime.run(), /imported fixture/);
});
