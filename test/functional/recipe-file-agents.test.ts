import assert from "node:assert/strict";
import { access, mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { createClaudeHarness } from "../../src/index.ts";
import { builtInAgents } from "../../src/adapters/agents/catalog.ts";
import {
  createRecipeRegistry,
  createRecipeRuntime,
  defineRecipeComponent,
  validateRecipeProject,
} from "../../src/recipes.ts";
import { createMemorySandboxProvider } from "../../src/testing.ts";

async function fixture(t: TestContext) {
  const directory = await mkdtemp(
    join(tmpdir(), "outpost-recipe-file-agents-"),
  );
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml");
  const config = join(directory, "outpost.yaml");
  await writeFile(
    file,
    JSON.stringify({
      version: 3,
      name: "file-agent",
      tasks: [{ key: "review", agent: "reviewer", brief: "Review files" }],
    }),
  );
  return { directory, file, config };
}

test("file recipes accept native CLI declarations without resolving account credentials", async (t) => {
  const { directory, file, config } = await fixture(t);
  await mkdir(join(directory, "source"));
  const workspaces = [
    { kind: "ephemeral" },
    { kind: "directory", directory: "./source" },
    ...[true, false].map((readOnly) => ({
      kind: "directory",
      directory: "./source",
      access: { mode: "mount", target: "source", readOnly },
    })),
  ];
  for (const descriptor of builtInAgents) {
    for (const workspace of workspaces) {
      await writeFile(
        config,
        JSON.stringify({
          version: 3,
          workspace,
          sandbox: { provider: "docker", image: "fixture:unused" },
          agents: {
            reviewer: {
              harness: descriptor.executable,
              authentication: { account: { file: "./missing-account.json" } },
            },
          },
        }),
      );
      const validation = await validateRecipeProject({ file, config });
      assert.equal(validation.configurationVersion, 3);
      assert.deepEqual(validation.agents, ["reviewer"]);
    }
  }
});

test("an ephemeral YAML recipe dispatches Claude through its native adapter", async (t) => {
  const { file, config } = await fixture(t);
  const adapter = createClaudeHarness({ saveConversations: false }).bind();
  const request = adapter.request({ text: "Review files" });
  const provider = createMemorySandboxProvider({
    commands: [
      {
        executable: request.executable,
        arguments: request.arguments ?? [],
        stdout:
          JSON.stringify({
            type: "result",
            result: "Reviewed files",
            is_error: false,
          }) + "\n",
      },
    ],
  });
  const registry = createRecipeRegistry({
    components: [
      defineRecipeComponent({
        name: "sandboxProvider.fixture",
        kind: "sandboxProvider",
        schema: { type: "object", additionalProperties: false },
        create: () => provider,
        accepts: (value) => value === provider,
      }),
    ],
  });
  await writeFile(
    config,
    JSON.stringify({
      version: 3,
      workspace: { kind: "ephemeral" },
      sandbox: { provider: "fixture" },
      agents: { reviewer: { harness: "claude", saveConversations: false } },
    }),
  );
  await using runtime = await createRecipeRuntime({ file, config, registry });
  const report = await runtime.run();
  assert.equal(report.status, "done", JSON.stringify(report.errors));
  assert.equal(report.outputs.review?.text, "Reviewed files");
  assert.equal(report.workspaceInfo?.kind, "ephemeral");
});

test("file recipes still refuse CLI adapters without validated file dispatch", async (t) => {
  const { directory, file, config } = await fixture(t);
  const harness = {
    kind: "cli",
    bind() {
      return {
        ...createClaudeHarness().bind(),
        fileWorkspaces: { dispatch: false },
      };
    },
  };
  const registry = createRecipeRegistry({
    components: [
      defineRecipeComponent({
        name: "harness.unvalidated",
        kind: "harness",
        schema: { type: "object", additionalProperties: false },
        create: () => harness,
        accepts: (value) => value === harness,
      }),
    ],
  });
  await writeFile(
    config,
    JSON.stringify({
      version: 3,
      workspace: { kind: "ephemeral" },
      runtime: { directory: "./runtime" },
      sandbox: { provider: "local" },
      agents: { reviewer: { harness: "unvalidated" } },
    }),
  );
  await using runtime = await createRecipeRuntime({ file, config, registry });
  await assert.rejects(runtime.run(), {
    message: /claude has not declared validated support for file workspaces/,
  });
  await assert.rejects(access(join(directory, "runtime")), { code: "ENOENT" });
});
