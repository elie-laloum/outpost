import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import Ajv from "ajv/dist/2020.js";
import { parse } from "yaml";
import { parseRecipe } from "../../src/infrastructure/recipe.ts";
import { starterRecipe } from "../../src/cli/recipe-init.constants.ts";

const schema = JSON.parse(
  await readFile(new URL("../../recipe.schema.json", import.meta.url), "utf8"),
);
const validate = new Ajv({ allowUnionTypes: true }).compile(schema);

test("recipe editor schema accepts both formats and the contribution starter", async () => {
  const example = await readFile(
    new URL("../../examples/64-yaml-recipes/recipe.yaml", import.meta.url),
    "utf8",
  );
  for (const source of [
    "version: 1\nname: legacy\ntasks: [{ key: check, command: { executable: node } }]",
    starterRecipe,
    example,
  ]) {
    assert.ok(validate(parse(source)), JSON.stringify(validate.errors));
    assert.ok(parseRecipe(source));
  }
});

test("recipe editor schema rejects malformed steps and input definitions", () => {
  for (const change of [
    {
      inputs: { goal: { type: "string", description: "Goal", default: false } },
    },
    { tasks: [{ key: "bad key", command: { executable: "node" } }] },
    {
      tasks: [
        {
          key: "mixed",
          command: { executable: "node" },
          agent: "coder",
          brief: "Fix",
        },
      ],
    },
    { tasks: [{ key: "empty", command: { executable: " " } }] },
    { unknown: true },
  ]) {
    const value = { ...parse(starterRecipe), ...change };
    assert.equal(validate(value), false, JSON.stringify(value));
    assert.throws(() => parseRecipe(JSON.stringify(value)));
  }
});

test("recipe execution schema describes the YAML configuration starter", async () => {
  const { starterRecipeConfiguration } =
    await import("../../src/cli/recipe-init.constants.ts");
  const configurationSchema = JSON.parse(
    await readFile(
      new URL("../../recipe-configuration.schema.json", import.meta.url),
      "utf8",
    ),
  );
  const validate = new Ajv({ allowUnionTypes: true }).compile(
    configurationSchema,
  );
  assert.ok(
    validate(parse(starterRecipeConfiguration)),
    JSON.stringify(validate.errors),
  );
  assert.equal(
    validate({
      version: 1,
      repository: ".",
      sandbox: { provider: "docker" },
      agents: {
        coder: {
          harness: "codex",
          authentication: { usage: { key: "literal-secret" } },
        },
      },
    }),
    false,
  );
});
