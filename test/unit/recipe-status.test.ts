import assert from "node:assert/strict";
import test from "node:test";
import { recipeStatusText } from "../../src/cli/recipe-status.ts";

test("status guidance identifies roles without authorizing automatic recovery", () => {
  assert.match(
    recipeStatusText("review", undefined),
    /Run: review\nStatus: not found/,
  );
  const status = {
    runId: "review",
    revision: "r1",
    owned: true,
    tasks: [],
    workspaces: {},
    executionId: "attempt",
  };
  const text = recipeStatusText("review", status);
  assert.match(text, /Execution: attempt/);
  assert.match(text, /Verify it has stopped before any explicit recovery/);
  assert.match(
    recipeStatusText("review", { ...status, owned: false }),
    /Inspect the saved task records/,
  );
});
