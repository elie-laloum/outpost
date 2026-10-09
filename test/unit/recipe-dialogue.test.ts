import assert from "node:assert/strict";
import { test } from "node:test";
import { continueRecipeDialogue } from "../../src/cli/recipe-dialogue.ts";
import { recipeInteractiveMode } from "../../src/cli/recipe-terminal.ts";
import { parseRecipe } from "../../src/infrastructure/recipe.ts";
import type { RecipeReport } from "../../src/application/recipe-report.types.ts";
import type { WorkflowInputRequest } from "../../src/domain/workflow/input.types.ts";
import type { RecipeResumeOptions } from "../../src/application/recipes/durable.types.ts";

const document = parseRecipe(
  JSON.stringify({
    version: 3,
    name: "dialogue",
    tasks: [{ key: "ask", interactive: { actors: ["owner"] } }],
  }),
);
const question: WorkflowInputRequest = {
  id: "question-1",
  key: "ask",
  executionId: "execution",
  requestedAt: new Date(0).toISOString(),
  question: "Your name?",
};
const waiting: RecipeReport = {
  name: "dialogue",
  runId: "run",
  status: "waiting-input",
  tasks: [],
  outputs: {},
  errors: [],
  inputRequests: [question],
};
const done: RecipeReport = { ...waiting, status: "done", inputRequests: [] };

test("terminal mode is automatic, supports explicit opt-out and keeps JSON headless by default", () => {
  assert.equal(recipeInteractiveMode({}, true), true);
  assert.equal(recipeInteractiveMode({}, false), false);
  assert.equal(recipeInteractiveMode({ json: true }, true), false);
  assert.equal(recipeInteractiveMode({ interactive: false }, true), false);
  assert.equal(
    recipeInteractiveMode({ json: true, interactive: true }, true),
    true,
  );
  assert.throws(
    () => recipeInteractiveMode({ interactive: true }, false),
    /requires a terminal/,
  );
});

test("each accepted answer is resumed and persisted before asking the next question", async () => {
  const controller = new AbortController();
  const calls: RecipeResumeOptions[] = [];
  const answers = ["Jean", "Lyon"];
  const report = await continueRecipeDialogue(
    {
      async resume(options) {
        calls.push(options);
        return calls.length === 1
          ? {
              ...waiting,
              inputRequests: [
                { ...question, id: "question-2", question: "Your city?" },
              ],
            }
          : done;
      },
    },
    waiting,
    document,
    {
      signal: controller.signal,
      cancel: () => assert.fail("Unexpected cancellation"),
      prompts: {
        async text() {
          assert.equal(calls.length, 2 - answers.length);
          return answers.shift();
        },
        async select() {
          assert.fail("The sole actor is inferred");
        },
      },
    },
  );
  assert.equal(report.status, "done");
  assert.deepEqual(
    calls.map((call) => call.answers?.[0]),
    [
      {
        executionId: "execution",
        key: "ask",
        requestId: "question-1",
        actor: "owner",
        value: "Jean",
      },
      {
        executionId: "execution",
        key: "ask",
        requestId: "question-2",
        actor: "owner",
        value: "Lyon",
      },
    ],
  );
  assert.ok(
    calls.every(
      (call) =>
        call.runId === "run" && !call.retryIncomplete && !call.recoverRevision,
    ),
  );
});

test("closed choices, free answers and local actor selection preserve their contracts", async () => {
  for (const free of [false, true]) {
    const multiple = {
      ...document,
      tasks: [
        { ...document.tasks[0]!, interactive: { actors: ["one", "two"] } },
      ],
    };
    const selections = [1, free ? 2 : 1];
    let response;
    await continueRecipeDialogue(
      {
        async resume(options) {
          response = options.answers?.[0];
          return done;
        },
      },
      {
        ...waiting,
        inputRequests: [
          { ...question, choices: ["A", "B"], allowFreeText: free },
        ],
      },
      multiple,
      {
        signal: new AbortController().signal,
        cancel: () => assert.fail("Cancelled"),
        prompts: {
          async text() {
            assert.equal(free, true);
            return "custom";
          },
          async select(_message, choices) {
            assert.equal(
              choices.length,
              selections.length === 2 ? 2 : free ? 3 : 2,
            );
            return selections.shift();
          },
        },
      },
    );
    assert.deepEqual(response, {
      executionId: "execution",
      key: "ask",
      requestId: "question-1",
      actor: "two",
      value: free ? "custom" : "B",
    });
  }
});

test("cancellation leaves the question pending and never submits an answer", async () => {
  let cancelled = false;
  const report = await continueRecipeDialogue(
    {
      async resume() {
        assert.fail("Must not resume");
      },
    },
    waiting,
    document,
    {
      signal: new AbortController().signal,
      cancel: () => {
        cancelled = true;
      },
      prompts: {
        async text() {
          return undefined;
        },
        async select() {
          return undefined;
        },
      },
    },
  );
  assert.equal(cancelled, true);
  assert.equal(report, waiting);
});

test("invalid actors and missing persisted questions fail without resuming", async () => {
  const runtime = {
    async resume() {
      assert.fail("Must not resume");
    },
  };
  const options = {
    signal: new AbortController().signal,
    cancel: () => {},
    prompts: {
      async text() {
        return "Jean";
      },
      async select() {
        return 0;
      },
    },
  };
  await assert.rejects(
    continueRecipeDialogue(runtime, waiting, document, {
      ...options,
      actor: "stranger",
    }),
    /not authorized/,
  );
  await assert.rejects(
    continueRecipeDialogue(
      runtime,
      { ...waiting, inputRequests: [] },
      document,
      options,
    ),
    /persisted question/,
  );
  const unknown = {
    ...document,
    tasks: [{ ...document.tasks[0]!, interactive: {} }],
  };
  await assert.rejects(
    continueRecipeDialogue(runtime, waiting, unknown, options),
    /pass --actor/,
  );
  const abort = new AbortController();
  abort.abort();
  assert.equal(
    await continueRecipeDialogue(runtime, waiting, document, {
      ...options,
      signal: abort.signal,
    }),
    waiting,
  );
});
