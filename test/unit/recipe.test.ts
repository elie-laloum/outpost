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
