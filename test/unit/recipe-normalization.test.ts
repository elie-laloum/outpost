import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { parseRecipe } from "../../src/infrastructure/recipe.ts";
import { normalizeRecipe } from "../../src/application/recipes/normalize.ts";
import { bindRecipeWorkflow } from "../../src/application/recipes/workflow.ts";
import { recipeObject } from "../../src/domain/recipes/values.ts";
import type { WorkflowCheckpointStore } from "../../src/domain/workflow/checkpoint.types.ts";

test("normalization preserves false, zero and null values and does not change the persisted recipe document", async () => {
  const document = parseRecipe(
    JSON.stringify({
      version: 3,
      name: "values",
      tasks: [false, 0, null].map((value, index) => ({
        key: `value-${index}`,
        value,
      })),
    }),
  );
  const before = JSON.stringify(document);
  const normalized = normalizeRecipe(document, { workflow: {}, steps: {} });
  assert.deepEqual(
    normalized.tasks.map((step) => step.kind),
    ["value", "value", "value"],
  );
  const workflow = bindRecipeWorkflow(document, {});
  const result = await workflow.start();
  result.unwrap();
  assert.deepEqual(
    workflow.tasks.map((task) => result.value(task)),
    [{ value: false }, { value: 0 }, { value: null }],
  );
  assert.equal(JSON.stringify(document), before);
});

test("ambiguous YAML operations report the task location and conflicting actions", () => {
  assert.throws(
    () =>
      parseRecipe(`version: 3
name: ambiguous
tasks:
  - key: broken
    agent: coder
    brief: Fix it
    command: { executable: node }
`),
    /tasks\[0\] requires exactly one task action; found command, agent \(line 4, column 5\)/,
  );
});

test("the normalized compiler resumes a checkpoint produced by 7060dcc2 without replaying completed effects", async () => {
  const fixture: unknown = JSON.parse(
    await readFile(
      new URL(
        "../fixtures/recipe-normalization-checkpoint.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  assert.ok(recipeObject(fixture));
  assert.equal(fixture.revision, "7060dcc2");
  let saved: unknown = fixture.checkpoint;
  const store: WorkflowCheckpointStore = {
    async acquire() {
      return {
        async read() {
          return saved;
        },
        async write(value) {
          saved = structuredClone(value);
        },
        async release() {},
      };
    },
  };
  const document = parseRecipe(JSON.stringify(fixture.recipe));
  const before = JSON.stringify(document);
  const workflow = bindRecipeWorkflow(
    document,
    {},
    {
      workflow: {
        checkpoint: {
          store,
          runId: "compatibility",
          version: "normalization-v1",
        },
      },
      steps: {
        select: {
          call: {
            perform() {
              assert.fail("A completed effect must not replay");
            },
          },
        },
        approve: {
          gate: {
            kind: "approval",
            prompt: "Continue?",
            actors: ["maintainer"],
          },
        },
      },
    },
  );
  const pending = await workflow.start();
  assert.equal(pending.status, "paused");
  const approval = pending.tasks.find((task) => task.key === "approve")?.pause;
  assert.ok(approval);
  const resumed = await workflow.start({
    decisions: [
      {
        executionId: pending.executionId,
        key: "approve",
        requestId: approval.id,
        action: "approve",
        actor: "maintainer",
        reason: "Reviewed saved evidence",
      },
    ],
  });
  resumed.unwrap();
  assert.equal(resumed.status, "done");
  assert.equal(resumed.executionId, pending.executionId);
  assert.equal(
    resumed.tasks.find((task) => task.key === "select")?.attempts,
    1,
  );
  assert.deepEqual(resumed.value(workflow.tasks[2]!), {
    value: { literal: "{{ inputs.goal }}", nested: [null, false, 0] },
  });
  assert.equal(JSON.stringify(document), before);
  const again = await workflow.start();
  assert.equal(again.status, "done");
  assert.deepEqual(again.usage, resumed.usage);
});

test("compiled expressions reuse references but read fresh outputs and interpolate once", async () => {
  const { compileRecipeExpression } =
    await import("../../src/domain/recipes/expressions.ts");
  const expression = compileRecipeExpression(
    "{{ steps.review.text }}",
    [],
    ["review"],
  );
  const context = {
    inputs: {},
    steps: ["review"],
    output: () => ({ text: "{{ inputs.secret }}" }),
  };
  assert.equal(expression(context), "{{ inputs.secret }}");
  assert.equal(
    expression({ ...context, output: () => ({ text: "updated" }) }),
    "updated",
  );
});
