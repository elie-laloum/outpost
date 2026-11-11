import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { Ajv2020 } from "ajv/dist/2020.js";
import { parse } from "yaml";
import { parseRecipe } from "../../src/infrastructure/recipe.ts";

const root = new URL("../../", import.meta.url);
const compile = async (file: string) =>
  new Ajv2020({ allowUnionTypes: true, strict: false }).compile(
    JSON.parse(await readFile(new URL(file, root), "utf8")),
  );
const validateRecipe = await compile("recipe.schema.json");
const validateConfiguration = await compile("recipe-configuration.schema.json");

async function yamlFiles(directory: string, name?: string) {
  const entries = await readdir(new URL(directory, root), {
    recursive: true,
  });
  return entries
    .map((entry) => entry.replaceAll("\\", "/"))
    .filter((entry) =>
      name ? entry.endsWith(`/${name}`) : entry.endsWith(".yaml"),
    )
    .map((entry) => `${directory}${entry}`);
}

const loopRecipe = (agent: Record<string, unknown>, phase: string) => ({
  version: 3,
  name: "loop",
  tasks: [
    {
      key: "implement",
      loop: {
        maxRounds: 2,
        attempt: { agent: "coder", brief: "Code." },
        check: [{ command: { executable: "npm" } }],
        [phase]: [{ agent: "coder", brief: "Work.", ...agent }],
      },
    },
  ],
});

test("editor schemas accept the bundled recipes and the example projects", async () => {
  const recipes = [
    ...(await yamlFiles("recipes/")),
    ...(await yamlFiles("examples/", "recipe.yaml")),
  ];
  const configurations = await yamlFiles("examples/", "outpost.yaml");
  assert.ok(recipes.length > 10 && configurations.length > 5);
  for (const { file, validate } of [
    ...recipes.map((file) => ({ file, validate: validateRecipe })),
    ...configurations.map((file) => ({
      file,
      validate: validateConfiguration,
    })),
  ]) {
    const value: unknown = parse(await readFile(new URL(file, root), "utf8"));
    assert.ok(validate(value), `${file}: ${JSON.stringify(validate.errors)}`);
  }
});

test("editor schemas keep fields named like descriptor metadata", () => {
  const artifact = {
    version: 3,
    name: "artifact",
    tasks: [
      {
        key: "evidence",
        artifact: {
          store: { $ref: "artifactStores.results" },
          contract: { $ref: "artifacts.evidence" },
        },
        data: { status: "ok" },
      },
    ],
  };
  assert.ok(validateRecipe(artifact), JSON.stringify(validateRecipe.errors));
  assert.ok(parseRecipe(JSON.stringify(artifact)));
  const secret = { env: "OUTPOST_WEBHOOK_SECRET" };
  const configuration = {
    version: 3,
    triggers: {
      github: { type: "github", secret },
      standard: { type: "standard", secret, toleranceMs: 300000 },
    },
  };
  assert.ok(
    validateConfiguration(configuration),
    JSON.stringify(validateConfiguration.errors),
  );
});

test("editor schemas refuse a continuation the loop manages", () => {
  for (const phase of ["attempt", "check"]) {
    const valid = loopRecipe({ dispatch: { passes: 1 } }, phase);
    assert.ok(validateRecipe(valid), JSON.stringify(validateRecipe.errors));
    const managed = loopRecipe(
      { dispatch: { continuation: { id: "previous" } } },
      phase,
    );
    assert.equal(validateRecipe(managed), false, phase);
    assert.throws(
      () => parseRecipe(JSON.stringify(managed)),
      /continuation is managed by the loop/,
    );
  }
});

test("editor schemas require one pass where the loop needs it", () => {
  const response = { $ref: "responses.review" };
  const twoPasses = loopRecipe({ dispatch: { passes: 2 } }, "attempt");
  assert.ok(validateRecipe(twoPasses), JSON.stringify(validateRecipe.errors));
  assert.ok(parseRecipe(JSON.stringify(twoPasses)));
  for (const [phase, agent] of [
    ["check", { dispatch: { passes: 2 } }],
    ["attempt", { conversation: "continue", dispatch: { passes: 2 } }],
    ["attempt", { dispatch: { response, passes: 2 } }],
  ] as const) {
    const refused = loopRecipe(agent, phase);
    assert.equal(validateRecipe(refused), false, JSON.stringify(agent));
    assert.throws(
      () => parseRecipe(JSON.stringify(refused)),
      /passes must be 1/,
    );
  }
});
