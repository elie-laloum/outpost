import assert from "node:assert/strict";
import test from "node:test";
import {
  configurationError,
  ConfigurationError,
} from "../../src/domain/configuration-diagnostic.ts";
import { recipeFileError } from "../../src/infrastructure/recipes/diagnostic.ts";
import { parseRecipe } from "../../src/infrastructure/recipe.ts";

test("YAML diagnostic locations do not depend on error wording", () => {
  for (const message of [
    "Unknown reviewer",
    "sandbox is mentioned but agents is the location",
  ]) {
    const error = recipeFileError(
      "config.yaml",
      "sandbox: {}\nagents:\n  reviewer: false\n",
      configurationError(message, ["agents", "reviewer"], "unknown-agent"),
    );
    assert.ok(error instanceof ConfigurationError);
    assert.equal(error.diagnostic.line, 3);
    assert.equal(error.diagnostic.column, 13);
    assert.deepEqual(error.diagnostic.path, ["agents", "reviewer"]);
    assert.equal(
      JSON.parse(JSON.stringify(error.diagnostic)).code,
      "unknown-agent",
    );
  }
});

test("recipe validation carries structured task locations through YAML parsing", () => {
  assert.throws(
    () =>
      parseRecipe(
        "version: 3\nname: invalid\ntasks:\n  - key: test\n    command: {}\n    agent: reviewer\n",
      ),
    (error) => {
      assert.ok(error instanceof ConfigurationError);
      assert.deepEqual(error.diagnostic.path, ["tasks", 0]);
      assert.equal(error.diagnostic.line, 4);
      return true;
    },
  );
});
