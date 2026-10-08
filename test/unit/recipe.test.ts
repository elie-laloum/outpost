import assert from "node:assert/strict";
import { test } from "node:test";
import { parseRecipe } from "../../src/infrastructure/recipe.ts";

const command = { key: "check", command: { executable: "node" } };
const recipe = (tasks: unknown = [command], extra: object = {}) =>
  JSON.stringify({ version: 1, name: "checks", tasks, ...extra });

test("recipe YAML preserves literals and orders forward dependencies", () => {
  const document = parseRecipe(`
version: 1
name: literal
tasks:
  - key: verify
    after: [fix]
    timeoutMs: 1000
    retry: { attempts: 2, delayMs: 0 }
    command:
      executable: node
      arguments: ["", "\${TOKEN}"]
      stdin: ""
      directory: src
      variables: { MESSAGE: "hello" }
      deadlineMs: 500
  - key: fix
    agent: coder
    brief: |
      Fix the parser.
      Keep \${TOKEN} literal.
`);
  assert.deepEqual(
    document.tasks.map((task) => task.key),
    ["fix", "verify"],
  );
  assert.equal(
    document.tasks[0]?.brief,
    "Fix the parser.\nKeep ${TOKEN} literal.\n",
  );
  assert.deepEqual(document.tasks[1]?.command, {
    executable: "node",
    arguments: ["", "${TOKEN}"],
    stdin: "",
    directory: "src",
    variables: { MESSAGE: "hello" },
    deadlineMs: 500,
  });
  assert.deepEqual(document.tasks[1]?.retry, { attempts: 2, delayMs: 0 });
});

test("recipe rejects malformed YAML and unsupported document constructs", () => {
  for (const source of [
    "[",
    "version: 1\nversion: 1",
    "---\nversion: 1\n---\nname: other",
    "name: !custom value",
    "tasks: &tasks [*tasks]",
  ])
    assert.throws(() => parseRecipe(source));
  assert.throws(() => parseRecipe("x".repeat(1_048_577)), /exceeds/);
});

test("recipe validates fields, task alternatives and command arguments", () => {
  for (const source of [
    "null",
    "[]",
    recipe([], { version: 2 }),
    recipe([], { name: "" }),
    recipe(null),
    recipe([]),
    recipe(Array.from({ length: 1001 }, () => command)),
    recipe([command], { include: "other.yaml" }),
  ])
    assert.throws(() => parseRecipe(source));
  for (const step of [
    null,
    { ...command, key: "bad key" },
    { ...command, typo: true },
    { ...command, after: "fix" },
    { ...command, after: [1] },
    { ...command, after: ["fix", "fix"] },
    { key: "fix" },
    { key: "fix", agent: "coder" },
    { ...command, agent: "coder" },
    { ...command, brief: "invalid" },
    { ...command, timeoutMs: 0 },
    { ...command, retry: { attempts: 0 } },
    { ...command, retry: { attempts: 1, delayMs: -1 } },
    { ...command, command: "node" },
    { ...command, command: { executable: "node", shell: true } },
    { ...command, command: { executable: "" } },
    { ...command, command: { executable: "node", arguments: "test" } },
    { ...command, command: { executable: "node", variables: { TOKEN: 42 } } },
    {
      ...command,
      command: { executable: "node", variables: { "BAD-NAME": "x" } },
    },
    { ...command, command: { executable: "node", stdin: 42 } },
    { ...command, command: { executable: "node", deadlineMs: 1.5 } },
  ])
    assert.throws(() => parseRecipe(recipe([step])), JSON.stringify(step));
});

test("recipe refuses duplicate keys, missing dependencies and cycles", () => {
  assert.throws(
    () => parseRecipe(recipe([command, command])),
    /duplicate task/,
  );
  assert.throws(
    () => parseRecipe(recipe([{ ...command, after: ["missing"] }])),
    /Unknown recipe dependency/,
  );
  assert.throws(
    () => parseRecipe(recipe([{ ...command, after: ["check"] }])),
    /cycle/,
  );
  assert.throws(
    () =>
      parseRecipe(
        recipe([
          { ...command, after: ["second"] },
          { ...command, key: "second", after: ["check"] },
        ]),
      ),
    /cycle/,
  );
});

test("recipe v2 validates typed defaults and explicit dependency references", () => {
  const document = {
    version: 2,
    name: "portable",
    description: "A reusable recipe",
    recipeVersion: "1.0.0",
    inputs: {
      goal: { type: "string", description: "Requested change" },
      count: { type: "number", description: "Count", default: 2, enum: [1, 2] },
      check: { type: "boolean", description: "Check", default: false },
    },
    tasks: [
      {
        key: "analyze.first",
        agent: "reviewer",
        brief: "Analyze {{ inputs.goal }}",
      },
      {
        key: "fix",
        agent: "coder",
        after: ["analyze.first"],
        brief: "{{ steps.analyze.first.text }}",
      },
    ],
  };
  assert.equal(parseRecipe(JSON.stringify(document)).inputs.count?.default, 2);
  const invalid = [
    { ...document, inputs: [] },
    {
      ...document,
      inputs: { "bad key": { type: "string", description: "Bad" } },
    },
    { ...document, inputs: { goal: { type: "array", description: "Bad" } } },
    { ...document, inputs: { goal: { type: "string" } } },
    {
      ...document,
      inputs: { goal: { type: "string", description: "Goal", typo: true } },
    },
    {
      ...document,
      inputs: { goal: { type: "string", description: "Goal", default: 2 } },
    },
    {
      ...document,
      inputs: { goal: { type: "string", description: "Goal", enum: [] } },
    },
    {
      ...document,
      inputs: { goal: { type: "string", description: "Goal", enum: [2] } },
    },
    {
      ...document,
      inputs: {
        goal: {
          type: "string",
          description: "Goal",
          enum: ["one"],
          default: "two",
        },
      },
    },
    {
      ...document,
      tasks: [{ key: "one", agent: "coder", brief: "{{ inputs.missing }}" }],
    },
    {
      ...document,
      tasks: [{ key: "one", agent: "coder", brief: "{{ inputs.goal.text }}" }],
    },
    {
      ...document,
      tasks: [{ key: "one", agent: "coder", brief: "{{ arbitrary.code() }}" }],
    },
    {
      ...document,
      tasks: [
        document.tasks[0],
        { key: "fix", agent: "coder", brief: "{{ steps.analyze.first.text }}" },
      ],
    },
    {
      ...document,
      tasks: [
        document.tasks[0],
        {
          key: "fix",
          agent: "coder",
          after: ["analyze.first"],
          brief: "{{ steps.analyze.first.stdout }}",
        },
      ],
    },
  ];
  for (const value of invalid)
    assert.throws(
      () => parseRecipe(JSON.stringify(value)),
      JSON.stringify(value),
    );
  const legacy = parseRecipe(
    recipe([
      { key: "literal", agent: "coder", brief: "{{ arbitrary.code() }}" },
    ]),
  );
  assert.equal(legacy.tasks[0]?.brief, "{{ arbitrary.code() }}");
});
