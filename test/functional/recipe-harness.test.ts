import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import {
  createRecipeRuntime,
  validateRecipeProject,
} from "../../src/recipes.ts";
import {
  createAgent,
  createHarness,
  createSandbox,
  createFallbackAgent,
  defineHarnessTool,
  defineHarnessSubagent,
  defineHarnessHook,
  defineHarnessPermissions,
  defineJsonResponse,
} from "../../src/index.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import {
  model,
  execute,
  hook,
  requests,
  observations,
} from "../fixtures/recipe-harness.ts";
import { readRecipeProject } from "../../src/application/recipes/project.ts";
import { createRecipeComponentScope } from "../../src/application/recipes/scope.ts";
import { nativeRecipeGuards } from "../../src/application/recipes/native.ts";
import type { CustomAgent } from "../../src/index.ts";

function isCustomAgent(value: unknown): value is CustomAgent {
  return (
    nativeRecipeGuards.agent!(value) &&
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    value.kind === "custom"
  );
}

test("YAML delegates through the existing harness, preserves fallback and matches TypeScript usage", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-harness-"));
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
  const module = resolve("test/fixtures/recipe-harness.ts");
  const extension = (kind: string, name: string) => ({
    module,
    export: name,
    kind,
    version: "1",
  });
  const schema = {
    type: "object",
    properties: { ok: { type: "boolean" } },
    required: ["ok"],
    additionalProperties: false,
  };
  const recipe = {
    version: 3,
    name: "delegated",
    tasks: [
      {
        key: "review",
        agent: "reviewer",
        brief: "Inspect safely",
        dispatch: { response: { $ref: "responses.answer" } },
      },
    ],
  };
  const declaration = {
    version: 2,
    repository: ".",
    sandbox: { provider: "local" },
    branch: { mode: "current" },
    extensions: {
      model: {
        ...extension("modelProvider", "model"),
        factory: true,
        schema: { type: "object", additionalProperties: false },
      },
      read: {
        ...extension("callback", "execute"),
        contract: "tool.custom.execute",
      },
      hook: { ...extension("callback", "hook"), contract: "hook.custom.run" },
      sink: extension("sink", "sink"),
    },
    observation: { sinks: [{ $ref: "extensions.sink" }] },
    tools: {
      read: {
        type: "custom",
        name: "read_fixture",
        description: "Read fixture in the borrowed sandbox",
        readOnly: true,
        input: { type: "object", additionalProperties: false },
        execute: { $ref: "extensions.read" },
      },
    },
    permissions: {
      readonly: {
        type: "rules",
        default: "deny",
        rules: [{ effect: "allow", tools: ["read_fixture", "delegate"] }],
      },
    },
    hooks: {
      setup: {
        type: "custom",
        on: "session-start",
        run: { $ref: "extensions.hook" },
      },
    },
    harnesses: {
      child: {
        type: "outpost",
        modelProvider: { $ref: "extensions.model" },
        tools: [{ $ref: "tools.read" }],
        permissions: { $ref: "permissions.readonly" },
      },
      parent: {
        type: "outpost",
        modelProvider: { $ref: "extensions.model" },
        tools: [{ $ref: "subagents.reader" }],
        hooks: [{ $ref: "hooks.setup" }],
        permissions: { $ref: "permissions.readonly" },
      },
    },
    subagents: {
      reader: {
        type: "subagent",
        name: "delegate",
        description: "Inspect the repository",
        agent: { $ref: "agents.child" },
      },
    },
    agents: {
      child: { harness: { $ref: "harnesses.child" }, model: "child" },
      primary: { harness: { $ref: "harnesses.parent" }, model: "unavailable" },
      secondary: { harness: { $ref: "harnesses.parent" }, model: "parent" },
      reviewer: {
        type: "fallback",
        agents: [{ $ref: "agents.primary" }, { $ref: "agents.secondary" }],
        on: ["unavailable"],
      },
    },
    responses: { answer: { type: "json", tag: "answer", jsonSchema: schema } },
  };
  await writeFile(file, JSON.stringify(recipe));
  await writeFile(config, JSON.stringify(declaration));
  await validateRecipeProject({ file, config });
  requests.length = 0;
  observations.length = 0;
  await using runtime = await createRecipeRuntime({ file, config });
  const yaml = await runtime.run();
  assert.equal(
    yaml.status,
    "done",
    JSON.stringify({
      errors: yaml.errors,
      models: requests.map((request) => request.model),
      events: observations.filter((event) => event.event.kind === "fallback"),
    }),
  );
  assert.match(String(yaml.outputs.review?.text ?? ""), /"ok":true/);
  assert.ok(observations.some((event) => event.event.kind === "subagent"));
  assert.ok(observations.some((event) => event.event.kind === "fallback"));
  assert.ok(
    requests.some((request) =>
      JSON.stringify(request).includes("Hook instructions"),
    ),
  );
  const models = requests.map((request) => request.model);

  requests.length = 0;
  const provider = model();
  const permissions = defineHarnessPermissions({
    default: "deny",
    rules: [{ effect: "allow", tools: ["read_fixture", "delegate"] }],
  });
  const child = createAgent({
    harness: createHarness({
      modelProvider: provider,
      tools: [
        defineHarnessTool({
          name: "read_fixture",
          description: "Read fixture in the borrowed sandbox",
          readOnly: true,
          input: { type: "object", additionalProperties: false },
          execute,
        }),
      ],
      permissions,
    }),
    model: "child",
  });
  const harness = createHarness({
    modelProvider: provider,
    tools: [
      defineHarnessSubagent({
        name: "delegate",
        description: "Inspect the repository",
        agent: child,
      }),
    ],
    hooks: [defineHarnessHook({ on: "session-start", run: hook })],
    permissions,
  });
  const agent = createFallbackAgent(
    [
      createAgent({ harness, model: "unavailable" }),
      createAgent({ harness, model: "parent" }),
    ],
    { on: ["unavailable"] },
  );
  await using sandbox = await createSandbox({
    repository: directory,
    branch: { mode: "current" },
    sandboxProvider: createLocalSandboxProvider(),
    logging: false,
  });
  const typescript = await sandbox.dispatch({
    agent,
    brief: { text: "Inspect safely" },
    response: defineJsonResponse({
      tag: "answer",
      jsonSchema: schema,
      schema: (value: unknown) => value,
    }),
  });
  assert.deepEqual(typescript.value, { ok: true });
  assert.deepEqual(
    requests.map((request) => request.model),
    models,
  );
  assert.equal(yaml.usage?.tokens.input, typescript.usage.input);
  assert.equal(yaml.usage?.tokens.output, typescript.usage.output);

  await writeFile(
    config,
    JSON.stringify({
      ...declaration,
      extensions: {
        ...declaration.extensions,
        read: { ...declaration.extensions.read, contract: "hook.custom.run" },
      },
    }),
  );
  await assert.rejects(
    validateRecipeProject({ file, config }),
    /requires callback contract tool.custom.execute/,
  );
});

test("YAML routing, skills, context and built-in toolsets retain native contracts", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-recipe-routing-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml"),
    config = join(directory, "outpost.yaml");
  const module = resolve("test/fixtures/recipe-harness.ts");
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "routing",
      tasks: [{ key: "review", agent: "reviewer", brief: "Review" }],
    }),
  );
  await writeFile(
    config,
    JSON.stringify({
      version: 2,
      repository: ".",
      sandbox: { provider: "local" },
      extensions: {
        model: {
          module,
          export: "model",
          kind: "modelProvider",
          version: "1",
          factory: true,
          schema: { type: "object", additionalProperties: false },
        },
        router: {
          module,
          export: "router",
          kind: "decisionProvider",
          version: "1",
        },
      },
      questions: {
        route: {
          type: "questions",
          questions: {
            route: {
              type: "choice",
              instructions: "Choose",
              criteria: { fast: "Simple", deep: "Complex" },
            },
          },
        },
      },
      routings: {
        quality: {
          type: "decision",
          provider: { $ref: "extensions.router" },
          model: "router",
          decision: { $ref: "questions.route" },
          question: "route",
          models: { fast: "small", deep: { name: "large", reasoning: "high" } },
          fallback: "deep",
        },
      },
      skills: {
        guide: {
          type: "custom",
          name: "guide",
          description: "Repository guidance",
          instructions: "Inspect before editing",
        },
      },
      contexts: {
        compact: { type: "truncate", keepRecent: 2, maxCharacters: 100 },
      },
      instructions: {
        system: { type: "source", source: "Literal {{instructions}}" },
      },
      toolsets: { shell: { type: "shell", deadlineMs: 5000 } },
      agents: {
        reviewer: {
          model: "small",
          harness: {
            type: "outpost",
            modelProvider: { $ref: "extensions.model" },
            routing: { $ref: "routings.quality" },
            context: { $ref: "contexts.compact" },
            skills: [{ $ref: "skills.guide" }],
            instructions: [{ $ref: "instructions.system" }],
            tools: [{ type: "files" }, { $ref: "toolsets.shell" }],
            conversations: { type: "harness" },
          },
        },
      },
    }),
  );
  const project = await readRecipeProject({ file, config });
  const scope = createRecipeComponentScope(
    project.graph,
    project.registry,
    directory,
    new AbortController().signal,
  );
  t.after(() => scope.close());
  const agent = await scope.resolve("agents.reviewer", "agent");
  assert.ok(isCustomAgent(agent));
  assert.deepEqual(agent.harness.routing?.models, {
    fast: { name: "small" },
    deep: { name: "large", reasoning: "high" },
  });
  assert.equal(agent.harness.skills[0]?.name, "guide");
  assert.equal(agent.harness.context?.name, "truncate-tool-results");
  assert.ok(agent.harness.tools.some((tool) => tool.name === "read_file"));
  assert.ok(agent.harness.tools.some((tool) => tool.name === "shell"));
  assert.equal(
    agent.harness.conversations && agent.harness.conversations.format,
    "harness",
  );
});
