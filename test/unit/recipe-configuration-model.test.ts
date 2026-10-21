import assert from "node:assert/strict";
import { test } from "node:test";
import { resolve } from "node:path";
import {
  readRecipeConfigurationModel,
  resolveRecipeEnvironment,
} from "../../src/application/recipes/configuration-model.ts";
import { parseRecipe } from "../../src/infrastructure/recipe.ts";

const file = resolve("workflow/execution.yaml");
const document = parseRecipe(
  JSON.stringify({
    version: 1,
    name: "model",
    tasks: [{ key: "check", command: { executable: "true" } }],
  }),
);
const environment = { TOKEN: "OUTPOST_MODEL_UNSET_VARIABLE" };

test("every configuration version reads into the same Git workspace model without reading the environment", async () => {
  const branch = { mode: "named", name: "work" };
  const declarations = [
    {
      version: 1,
      repository: "../repository",
      branch,
      environment,
      sandbox: { provider: "local" },
      agents: { coder: { harness: "codex", authentication: "account" } },
    },
    {
      version: 2,
      repository: "../repository",
      branch,
      environment,
      agents: { coder: { $ref: "agents.codex" } },
    },
    {
      version: 3,
      workspace: { kind: "git", repository: "../repository", branch },
      environment,
      agents: { coder: { $ref: "agents.codex" } },
    },
  ];
  for (const declaration of declarations) {
    const model = await readRecipeConfigurationModel(
      declaration,
      file,
      document,
    );
    assert.equal(model.version, declaration.version);
    assert.deepEqual(model.workspace, {
      kind: "git",
      repository: resolve("repository"),
      branch,
    });
    assert.deepEqual(model.agents, ["coder"]);
    assert.deepEqual(model.environment, environment);
  }
  const v3 = await readRecipeConfigurationModel(
    declarations[2]!,
    file,
    document,
  );
  assert.equal(v3.components.repository, "../repository");
  assert.equal(v3.components.version, 3);
});

test("file configurations keep their workspace declarations beside the component declarations", async () => {
  const model = await readRecipeConfigurationModel(
    {
      version: 3,
      workspace: { kind: "ephemeral" },
      sandbox: { provider: "local" },
      environment,
    },
    file,
    document,
  );
  assert.equal(model.workspace.kind, "files");
  assert.deepEqual(
    model.workspace.kind === "files" && model.workspace.files.source,
    { kind: "ephemeral" },
  );
  assert.deepEqual(model.environment, environment);
  assert.equal(model.components.runtime, undefined);
});

test("declared environment names are validated when read and resolved only on request", async () => {
  await assert.rejects(
    readRecipeConfigurationModel(
      {
        version: 2,
        repository: ".",
        environment: { "not valid": "OUTPOST_TOKEN" },
      },
      file,
      document,
    ),
    /Invalid environment variable name/,
  );
  assert.throws(
    () => resolveRecipeEnvironment(environment),
    /Missing declared environment variable: OUTPOST_MODEL_UNSET_VARIABLE/,
  );
  process.env.OUTPOST_MODEL_SET_VARIABLE = "value";
  try {
    assert.deepEqual(
      resolveRecipeEnvironment({ TOKEN: "OUTPOST_MODEL_SET_VARIABLE" }),
      { TOKEN: "value" },
    );
  } finally {
    delete process.env.OUTPOST_MODEL_SET_VARIABLE;
  }
});
