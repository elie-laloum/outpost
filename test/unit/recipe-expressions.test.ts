import assert from "node:assert/strict";
import { test } from "node:test";
import {
  compileRecipeCondition,
  evaluateRecipeCondition,
  recipeCondition,
  recipeExpression,
  validateRecipeCondition,
  validateRecipeExpression,
} from "../../src/domain/recipes/expressions.ts";
import { validateRecipe } from "../../src/domain/recipe.ts";
import { parseRecipe } from "../../src/infrastructure/recipe.ts";
import { ConfigurationError } from "../../src/domain/configuration-diagnostic.ts";

test("recipe comparisons preserve JSON types, existence and single-pass text", () => {
  const context = {
    steps: ["previous", "dotted.key"],
    inputs: {
      message: "{{ inputs.missing }}",
      object: { count: 2 },
      choices: ["a", "b"],
    },
    output: () => ({ value: { answer: 42 } }),
  };
  for (const condition of [
    {
      eq: [
        { b: 2, a: 1 },
        { a: 1, b: 2 },
      ],
    },
    { ne: [1, "1"] },
    { gt: [2, 1] },
    { gte: [2, 2] },
    { lt: ["a", "b"] },
    { lte: [3, 3] },
    { in: ["b", { $input: "choices" }] },
    { not: { exists: { $input: "object", path: ["absent"] } } },
    { any: [false, true] },
    { all: [true, { eq: [1, 1] }] },
  ])
    assert.equal(recipeCondition(condition, context), true);
  assert.equal(
    recipeExpression("{{ inputs.message }}", context),
    "{{ inputs.missing }}",
  );
  assert.deepEqual(
    recipeExpression(
      {
        selected: { $step: "previous", path: ["value", "answer"] },
        data: { $input: "object" },
      },
      context,
    ),
    { selected: 42, data: { count: 2 } },
  );
  assert.equal(
    recipeExpression(
      "{{ inputs.object.count }} / {{ steps.dotted.key.value.answer }}",
      context,
    ),
    "2 / 42",
  );
  assert.throws(
    () => recipeExpression("{{ inputs.object }}", context),
    /scalar/,
  );
  assert.throws(
    () => recipeCondition({ lt: [1, "2"] }, context),
    /two numbers or two strings/,
  );
  assert.throws(() => recipeCondition({ in: [1, 2] }, context), /array/);
  assert.equal(
    recipeCondition(
      { exists: { $input: "object", path: ["toString"] } },
      context,
    ),
    false,
  );
});

test("recipe expression validation rejects malformed references while literal JSON stays opaque", () => {
  const document = parseRecipe(
    "version: 3\nname: check\ninputs:\n  value: { type: number, description: A value }\ntasks:\n  - key: first\n    value: 1\n  - key: second\n    after: [first]\n    value: 2\n",
  );
  const context = { document, step: document.tasks[1]! };
  for (const value of [
    { $input: 1 },
    { $step: "first", path: [-1] },
    { $step: "first", path: "value" },
    { $literal: 1, extra: 2 },
    { $select: { from: 1 } },
    { $input: "missing" },
    NaN,
    undefined,
  ])
    assert.throws(() => validateRecipeExpression(value, context));
  validateRecipeExpression({ $literal: { $input: "missing" } }, context);
});

test("compiled expressions keep each reference once with its source location", async () => {
  const { compileRecipeExpression, compileRecipeCondition } =
    await import("../../src/domain/recipes/expressions.ts");
  const scope = { inputs: ["topic"], steps: ["review"] };
  assert.deepEqual(
    compileRecipeExpression(
      {
        summary: { $step: "review", path: ["summary"] },
        line: "Topic {{ inputs.topic }}",
      },
      scope,
      ["tasks", 2, "arguments"],
    ),
    {
      kind: "object",
      entries: [
        [
          "summary",
          {
            kind: "step-value",
            step: "review",
            path: ["summary"],
            sourcePath: ["tasks", 2, "arguments", "summary"],
          },
        ],
        [
          "line",
          {
            kind: "text",
            text: "Topic {{ inputs.topic }}",
            interpolations: [
              {
                source: "{{ inputs.topic }}",
                reference: {
                  kind: "input-value",
                  input: "topic",
                  path: [],
                  sourcePath: ["tasks", 2, "arguments", "line"],
                },
              },
            ],
            sourcePath: ["tasks", 2, "arguments", "line"],
          },
        ],
      ],
    },
  );
  assert.deepEqual(
    compileRecipeCondition({ not: { exists: { $input: "topic" } } }, scope),
    {
      kind: "not",
      item: {
        kind: "exists",
        expression: {
          kind: "input-value",
          input: "topic",
          path: [],
          sourcePath: ["not", "exists"],
        },
      },
    },
  );
});

test("expression validation errors point at the task in source order", async () => {
  const { ConfigurationError } =
    await import("../../src/domain/configuration-diagnostic.ts");
  const { recipeTaskSourcePath } = await import("../../src/domain/recipe.ts");
  const source = (value: string) =>
    `version: 3\nname: located\ntasks:\n  - key: second\n    after: [first]\n    value: ${value}\n  - key: first\n    value: 1\n  - key: other\n    value: 2\n`;
  const document = parseRecipe(source("{ $step: first }"));
  assert.equal(document.tasks.at(-1)?.key, "second");
  assert.deepEqual(recipeTaskSourcePath(document, document.tasks.at(-1)!), [
    "tasks",
    0,
  ]);
  for (const [value, path, message] of [
    ["{ $step: other }", ["tasks", 0, "value"], /declare other in after/],
    [
      "{ items: [{ $input: missing }] }",
      ["tasks", 0, "value", "items", 0],
      /unknown recipe input missing/,
    ],
    ['"{{ steps.other.text }}"', ["tasks", 0, "value"], /declare other/],
  ] as const)
    assert.throws(
      () => parseRecipe(source(value)),
      (error) => {
        assert.ok(error instanceof ConfigurationError);
        assert.deepEqual(error.diagnostic.path, path);
        assert.match(error.message, message);
        return true;
      },
    );
});

test("loop values interpolate only where a loop field provides them", () => {
  const document = parseRecipe(
    "version: 3\nname: check\ninputs:\n  goal: { type: string, description: A goal }\ntasks:\n  - key: first\n    value: 1\n",
  );
  const step = document.tasks[0]!;
  validateRecipeExpression("{{ inputs.goal }} {{ loop.feedback }}", {
    document,
    step,
    loop: ["round", "feedback"],
  });
  assert.throws(
    () =>
      validateRecipeExpression("{{ loop.feedback }}", {
        document,
        step,
        sourcePath: ["tasks", 0, "value"],
      }),
    (error: unknown) =>
      error instanceof ConfigurationError &&
      /only available inside a loop attempt or check/.test(error.message) &&
      error.diagnostic.path.join(".") === "tasks.0.value",
  );
  assert.throws(
    () =>
      validateRecipeExpression("{{ loop.text }}", {
        document,
        step,
        loop: ["round", "feedback"],
      }),
    /not available here; use \{\{ loop.round \}\} or \{\{ loop.feedback \}\}/,
  );
  const context = {
    steps: [],
    inputs: { goal: "ship" },
    output: () => undefined,
    loop: { round: 2, feedback: "tests fail" },
  };
  assert.equal(
    recipeExpression(
      "{{ inputs.goal }} #{{ loop.round }}: {{ loop.feedback }}",
      context,
    ),
    "ship #2: tests fail",
  );
  assert.throws(
    () =>
      recipeExpression("{{ loop.feedback }}", {
        steps: [],
        inputs: {},
        output: () => undefined,
      }),
    /only available inside a loop/,
  );
});

test("each loop step position interpolates only its own loop values", () => {
  const recipe = (
    attempt: readonly object[],
    check: readonly object[] = [{ command: { executable: "true" } }],
  ) => ({
    version: 3,
    name: "positions",
    tasks: [{ key: "loop", loop: { maxRounds: 2, attempt, check } }],
  });
  const located = (path: string, pattern: RegExp) => (error: unknown) =>
    error instanceof ConfigurationError &&
    error.diagnostic.path.join(".") === path &&
    pattern.test(error.message);
  validateRecipe(
    recipe(
      [
        {
          agent: "coder",
          brief: "#{{ loop.round }} {{ loop.feedback }}",
          followUp: "#{{ loop.round }} {{ loop.feedback }}",
        },
        { command: { executable: "echo", arguments: ["{{ loop.round }}"] } },
      ],
      [
        { command: { executable: "echo", arguments: ["{{ loop.round }}"] } },
        { agent: "reviewer", brief: "#{{ loop.round }} {{ loop.text }}" },
      ],
    ),
  );
  for (const [attempt, check, path, pattern] of [
    [
      [{ agent: "coder", brief: "{{ loop.text }}" }],
      undefined,
      "tasks.0.loop.attempt.0.brief",
      /use \{\{ loop.round \}\} or \{\{ loop.feedback \}\}/,
    ],
    [
      [
        { agent: "coder", brief: "Fix." },
        { command: { executable: "echo", arguments: ["{{ loop.feedback }}"] } },
      ],
      undefined,
      "tasks.0.loop.attempt.1.command.arguments.0",
      /use \{\{ loop.round \}\}$/,
    ],
    [
      [{ agent: "coder", brief: "Fix." }],
      [{ agent: "reviewer", brief: "{{ loop.feedback }}" }],
      "tasks.0.loop.check.0.brief",
      /use \{\{ loop.round \}\} or \{\{ loop.text \}\}/,
    ],
    [
      [{ agent: "coder", brief: "Fix." }],
      [
        {
          agent: "reviewer",
          brief: "Review.",
          done: { eq: ["{{ loop.round }}", "2"] },
        },
      ],
      "tasks.0.loop.check.0.done.eq.0",
      /\{\{ loop.round \}\}/,
    ],
  ] as const)
    assert.throws(
      () => validateRecipe(recipe(attempt, check)),
      located(path, pattern),
    );
});

test("$response reads a check agent's typed response only inside done", () => {
  const scope = { inputs: [], steps: [], response: true };
  const response = { score: 9, issues: [], nested: { ok: true } };
  const context = { inputs: {}, steps: [], output: () => undefined, response };
  const evaluate = (condition: unknown) =>
    evaluateRecipeCondition(compileRecipeCondition(condition, scope), context);
  assert.equal(evaluate({ gte: [{ $response: ["score"] }, 8] }), true);
  assert.equal(evaluate({ eq: [{ $response: ["issues"] }, []] }), true);
  assert.equal(evaluate({ eq: [{ $response: [] }, response] }), true);
  assert.equal(evaluate({ exists: { $response: ["nested", "ok"] } }), true);
  assert.equal(evaluate({ exists: { $response: ["missing"] } }), false);
  assert.throws(
    () => evaluate({ gte: [{ $response: ["missing"] }, 1] }),
    /Missing recipe field: missing/,
  );
  assert.throws(
    () => evaluate({ gte: [{ $response: ["issues"] }, 1] }),
    /ordering requires two numbers or two strings/,
  );
  assert.throws(
    () =>
      evaluateRecipeCondition(
        compileRecipeCondition({ exists: { $response: [] } }, scope),
        { inputs: {}, steps: [], output: () => undefined },
      ),
    /\$response is unavailable here/,
  );
  for (const malformed of [
    { $response: "score" },
    { $response: ["score"], path: [] },
    { $response: [-1] },
  ])
    assert.throws(
      () => compileRecipeCondition({ exists: malformed }, scope, ["done"]),
      (error: unknown) =>
        error instanceof ConfigurationError &&
        error.diagnostic.path.join(".") === "done.exists",
    );
  const document = parseRecipe(
    "version: 3\nname: check\ntasks:\n  - key: first\n    value: 1\n",
  );
  const step = document.tasks[0]!;
  assert.throws(
    () =>
      validateRecipeCondition(
        { eq: [{ $response: ["score"] }, 1] },
        { document, step, sourcePath: ["tasks", 0, "when"] },
      ),
    (error: unknown) =>
      error instanceof ConfigurationError &&
      /only available in the done condition/.test(error.message) &&
      error.diagnostic.path.join(".") === "tasks.0.when.eq.0",
  );
  assert.throws(
    () =>
      validateRecipe({
        version: 3,
        name: "reserved",
        tasks: [{ key: "first", value: { $response: ["score"] } }],
      }),
    (error: unknown) =>
      error instanceof ConfigurationError &&
      error.diagnostic.path.join(".") === "tasks.0.value",
  );
  assert.deepEqual(
    recipeExpression(
      { $literal: { $response: ["score"] } },
      { inputs: {}, steps: [], output: () => undefined },
    ),
    { $response: ["score"] },
  );
});
