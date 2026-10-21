import assert from "node:assert/strict";
import { test } from "node:test";
import {
  recipeCondition,
  recipeExpression,
  validateRecipeExpression,
} from "../../src/domain/recipes/expressions.ts";
import { parseRecipe } from "../../src/infrastructure/recipe.ts";

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
