import assert from "node:assert/strict";
import test from "node:test";
import { continueRecipeDialogue } from "../../src/cli/recipe-dialogue.ts";
import { parseRecipe } from "../../src/infrastructure/recipe.ts";
import type { RecipeReport } from "../../src/application/recipe-report.types.ts";
import type { RecipeResumeOptions } from "../../src/application/recipes/durable.types.ts";

const document = parseRecipe(
  JSON.stringify({
    version: 3,
    name: "review",
    tasks: [
      { key: "plan", value: "Proposed changes" },
      {
        key: "approval",
        after: ["plan"],
        gate: {
          kind: "approval",
          actors: ["owner"],
          prompt: "Approve this plan?",
        },
      },
    ],
  }),
);
const paused: RecipeReport = {
  name: "review",
  runId: "review",
  executionId: "execution",
  status: "paused",
  outputs: { plan: { text: "Saved plan: add a test." } },
  errors: [],
  tasks: [
    {
      key: "approval",
      status: "paused",
      attempts: 0,
      pause: {
        id: "request",
        requestedAt: new Date(0).toISOString(),
        kind: "approval",
        actors: ["owner"],
        prompt: "Approve this plan?",
      },
    },
  ],
};

test("terminal gate decisions show saved evidence and retain native IDs, actors and reasons", async () => {
  for (const kind of ["approval", "pause"] as const) {
    const accepted = kind === "approval" ? "approve" : "resume";
    for (const choice of [1, 2]) {
      const calls: RecipeResumeOptions[] = [],
        displayed: string[] = [];
      const report = await continueRecipeDialogue(
        {
          async resume(options) {
            calls.push(options);
            return { ...paused, status: "done" };
          },
        },
        {
          ...paused,
          tasks: [
            {
              ...paused.tasks[0]!,
              pause: { ...paused.tasks[0]!.pause!, kind },
            },
          ],
        },
        document,
        {
          signal: new AbortController().signal,
          cancel: () => assert.fail("Unexpected cancellation"),
          prompts: {
            write: (text) => {
              displayed.push(text);
            },
            async select(_prompt, choices) {
              assert.equal(choices[0], "Leave pending");
              return choice;
            },
            async text() {
              return "Reviewed the tests";
            },
          },
        },
      );
      assert.equal(report.status, "done");
      assert.match(displayed.join(""), /Saved plan: add a test/);
      assert.deepEqual(calls, [
        {
          runId: "review",
          signal: calls[0]!.signal,
          decisions: [
            {
              executionId: "execution",
              key: "approval",
              requestId: "request",
              action: choice === 2 ? "reject" : accepted,
              actor: "owner",
              reason: "Reviewed the tests",
            },
          ],
        },
      ]);
    }
  }
});

test("leaving a gate pending, cancelling and signed gates never publish an implicit decision", async () => {
  for (const mode of [
    "pending",
    "selection-cancel",
    "reason-cancel",
    "signed",
    "quota",
  ] as const) {
    let cancelled = false,
      asked = false;
    const input = {
      ...paused,
      tasks: paused.tasks.map((task) => ({
        ...task,
        ...(mode === "signed"
          ? { pause: { ...task.pause!, authentication: "signed" as const } }
          : {}),
      })),
    };
    if (mode === "quota") input.tasks = [];
    const report = await continueRecipeDialogue(
      {
        async resume() {
          assert.fail("Decision must not be submitted");
        },
      },
      input,
      document,
      {
        signal: new AbortController().signal,
        cancel: () => {
          cancelled = true;
        },
        prompts: {
          async select() {
            asked = true;
            if (mode === "pending") return 0;
            if (mode === "selection-cancel") return undefined;
            return 1;
          },
          async text() {
            return undefined;
          },
        },
      },
    );
    assert.equal(report, input);
    assert.equal(cancelled, mode.endsWith("cancel"));
    assert.equal(asked, mode !== "signed" && mode !== "quota");
  }
});

test("a gate refuses unauthorized actors and missing persisted identity", async () => {
  const runtime = {
    async resume() {
      assert.fail("Unexpected resume");
    },
  };
  const options = {
    actor: "stranger",
    signal: new AbortController().signal,
    cancel() {},
    prompts: {
      async select() {
        return 1;
      },
      async text() {
        return "reason";
      },
    },
  };
  await assert.rejects(
    continueRecipeDialogue(runtime, paused, document, options),
    /not authorized/,
  );
  const { executionId: _, ...missing } = paused;
  await assert.rejects(
    continueRecipeDialogue(runtime, missing, document, options),
    /persisted execution/,
  );
});
