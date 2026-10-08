import { mapRecipeSchema } from "../../src/domain/recipes/schema-walk.ts";
import { recordRecovery } from "../../src/domain/errors.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import { recipeRuntimeError } from "../../src/application/recipes/errors.ts";
import { createRecipeComponentScope } from "../../src/application/recipes/scope.ts";
import { createRecipeRegistry } from "../../src/recipes.ts";
import { OutpostError, recoveryDetails } from "../../src/index.ts";

test("recipe redaction retains fault classification, recovery and cleanup causes", () => {
  const scope = createRecipeComponentScope(
    { nodes: new Map() },
    createRecipeRegistry(),
    process.cwd(),
    new AbortController().signal,
  );
  const fault = new OutpostError("provider", "secret-token failed", {
    stdout: "secret-token",
    status: 3,
  });
  recordRecovery(fault, { resource: "secret-token" });
  assert.equal(recipeRuntimeError(fault, scope), fault);
  scope.protect(["secret-token"]);
  const redacted = recipeRuntimeError(fault, scope);
  assert.ok(redacted instanceof OutpostError);
  assert.equal(redacted.code, "provider");
  assert.equal(redacted.details.status, 3);
  assert.equal(JSON.stringify(redacted).includes("secret-token"), false);
  assert.notEqual(recoveryDetails(redacted)?.resource, "secret-token");
  const aggregate = recipeRuntimeError(
    new AggregateError(
      [fault, new Error("secret-token cleanup")],
      "secret-token failures",
    ),
    scope,
  );
  assert.ok(aggregate instanceof AggregateError);
  assert.equal(aggregate.errors.length, 2);
  assert.ok(aggregate.errors[0] instanceof OutpostError);
  const recursive = new Error("secret-token");
  recursive.cause = recursive;
  assert.doesNotThrow(() => recipeRuntimeError(recursive, scope));
});

test("component unions prefer the matching category and expose incompatible declared references", () => {
  const schema = {
    anyOf: [
      { component: "tool" },
      { component: "toolset" },
      { type: "object" },
    ],
  };
  const value = { $ref: "toolsets.shell" };
  const match = (kind: string) => kind === "toolset" || kind === "*";
  assert.equal(
    mapRecipeSchema(
      schema,
      value,
      (shape) => shape.component,
      "",
      schema,
      match,
    ),
    "toolset",
  );
  const other = { anyOf: [{ component: "agent" }, { type: "object" }] };
  assert.equal(
    mapRecipeSchema(other, value, (shape) => shape.component, "", other, match),
    "agent",
  );
});
