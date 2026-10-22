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

test("located configuration checks keep their cause and never relocate a diagnostic", async () => {
  const { configurationInvariant, locateConfiguration } =
    await import("../../src/domain/configuration-diagnostic.ts");
  assert.throws(
    () =>
      configurationInvariant(
        false,
        "Bad value",
        "outputs[1].policy",
        "invalid-value",
        "Use create.",
      ),
    (error) => {
      assert.ok(error instanceof ConfigurationError);
      assert.deepEqual(error.diagnostic, {
        code: "invalid-value",
        path: ["outputs", 1, "policy"],
        message: "Bad value",
        hint: "Use create.",
      });
      return true;
    },
  );
  const cause = new Error("Workspace selection must not be empty");
  assert.throws(
    () =>
      locateConfiguration(["outputs", 0, "paths"], () => {
        throw cause;
      }),
    (error) => {
      assert.ok(error instanceof ConfigurationError);
      assert.equal(error.cause, cause);
      assert.equal(error.message, cause.message);
      assert.deepEqual(error.diagnostic.path, ["outputs", 0, "paths"]);
      return true;
    },
  );
  const inner = configurationError("Inner", ["workspace", "kind"]);
  assert.throws(
    () =>
      locateConfiguration(["workspace"], () => {
        throw inner;
      }),
    (error) => error === inner,
  );
  assert.equal(
    locateConfiguration(["workspace"], () => 3),
    3,
  );
});
