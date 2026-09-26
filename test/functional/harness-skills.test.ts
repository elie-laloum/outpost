import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agent,
  defineHarnessSkill,
  defineHarnessTool,
  defineHarnessToolset,
  dispatch,
  harness,
  type AgentObservation,
  type ModelProvider,
  type ModelRequest,
  type ModelResult,
} from "../../src/index.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { repository } from "../helpers.ts";

const done = "<outpost>done</outpost>";
type Reply = (request: ModelRequest) => ModelResult;
const call =
  (name: string, input: unknown): Reply =>
  (request) => ({
    text: "",
    content: [
      {
        type: "tool-call",
        id: `c${request.messages?.length ?? 0}`,
        name,
        input,
      },
    ],
    stopReason: "tool-calls",
  });
const answer: Reply = () => ({
  text: done,
  content: [{ type: "text", text: done }],
  stopReason: "end",
});
const lastResult = (request: ModelRequest | undefined) => {
  const block = request?.messages?.at(-1)?.content[0];
  return block?.type === "tool-result"
    ? `${block.isError ? "error: " : ""}${block.content}`
    : undefined;
};

const migrate = defineHarnessTool({
  name: "migrate_schema",
  description: "Apply a schema migration.",
  input: { type: "object" },
  execute: () => "migrated",
});
const migrations = defineHarnessSkill({
  name: "migrations",
  description: "Plan and apply database migrations.",
  instructions: ({ model }) => `Always back up first (${model.name}).`,
  tools: [defineHarnessToolset({ name: "db", tools: [migrate] })],
});
const style = defineHarnessSkill({
  name: "style",
  description: "House writing style.",
  instructions: "Write short sentences.",
});

test("skills are listed, loaded on demand and gate their tools", async (t) => {
  const root = await repository(t);
  const requests: ModelRequest[] = [];
  const events: AgentObservation[] = [];
  const replies = [
    call("migrate_schema", {}),
    call("load_skill", { name: "migrations" }),
    call("migrate_schema", {}),
    call("load_skill", { name: "unknown" }),
    answer,
  ];
  const provider: ModelProvider = {
    name: "scripted",
    async request(request) {
      requests.push(request);
      return replies.shift()!(request);
    },
  };
  const selected = agent({
    model: "m",
    harness: harness({
      modelProvider: provider,
      instructions: "Base.",
      skills: [migrations, style],
    }),
  });
  const result = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: selected,
    brief: { text: "update schema" },
    logging: false,
    observe: (event) => events.push(event),
  });
  assert.equal(result.completed, true);
  assert.equal(
    requests[0]?.system,
    "Base.\n\nSkills are available on demand. Call load_skill with a skill name to read its instructions and enable its tools before using them:\n- migrations: Plan and apply database migrations.\n- style: House writing style.",
  );
  for (const request of requests)
    assert.deepEqual(
      request.tools?.map((tool) => tool.name),
      ["migrate_schema", "load_skill"],
    );
  assert.equal(
    lastResult(requests[1]),
    "error: Denied: Load the migrations skill with load_skill before using migrate_schema",
  );
  assert.equal(
    lastResult(requests[2]),
    "Always back up first (m).\n\nTools now available: migrate_schema.",
  );
  assert.equal(lastResult(requests[3]), "migrated");
  assert.match(
    lastResult(requests[4]) ?? "",
    /^error: Invalid input for load_skill/,
  );
  assert.equal(
    events.filter((event) => event.kind === "tool-denied").length,
    1,
  );
  const resumed: ModelRequest[] = [];
  const again = [call("migrate_schema", {}), answer];
  await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent: agent({
      model: "m",
      harness: harness({
        modelProvider: {
          name: "scripted",
          async request(request) {
            resumed.push(request);
            return again.shift()!(request);
          },
        },
        skills: [migrations, style],
      }),
    }),
    brief: { text: "migrate again" },
    continuation: { id: result.conversation! },
    logging: false,
  });
  assert.equal(lastResult(resumed[1]), "migrated");
});

test("skill definitions are validated and cannot collide with tools", () => {
  const modelProvider: ModelProvider = {
    name: "p",
    request: async () => ({ text: "" }),
  };
  for (const [options, pattern] of [
    [{ name: "bad name", description: "x", instructions: "y" }, /Skill names/],
    [{ name: "ok", description: " ", instructions: "y" }, /description/],
    [{ name: "ok", description: "x", instructions: " " }, /Instructions/],
    [
      { name: "ok", description: "x", instructions: "y", when: 1 },
      /accept name/,
    ],
  ] as const)
    assert.throws(() => defineHarnessSkill(options as never), pattern);
  assert.throws(
    () => harness({ modelProvider, skills: [style, style] }),
    /Duplicate skill name: style/,
  );
  assert.throws(
    () => harness({ modelProvider, skills: [{ name: "raw" }] as never }),
    /defineHarnessSkill/,
  );
  assert.throws(
    () =>
      harness({
        modelProvider,
        tools: [
          defineHarnessTool({
            name: "load_skill",
            description: "Shadow.",
            input: { type: "object" },
            execute: () => "",
          }),
        ],
        skills: [style],
      }),
    /Duplicate tool name: load_skill/,
  );
  assert.deepEqual(harness({ modelProvider }).skills, []);
});
