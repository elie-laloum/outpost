import assert from "node:assert/strict";
import { test } from "node:test";
import type { TestContext } from "node:test";
import {
  agentTask,
  createSandbox,
  dispatch,
  fallbackAgent,
  OutpostError,
  quotaFault,
  unavailableFault,
  workflow,
} from "../../src/index.ts";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type {
  AgentInput,
  AgentObservation,
  CliAgent,
  ConversationStore,
  FallbackTrigger,
} from "../../src/index.ts";
import { recoveryDetails } from "../../src/domain/errors.ts";
import { localSandboxProvider } from "../../src/providers/local.ts";
import { emit, repository, scripted } from "../helpers.ts";

const line = (event: object) =>
  `console.log(${JSON.stringify(JSON.stringify(event))});`;

const usage = (input: number, output: number) =>
  line({ kind: "usage", tokens: { input, cached: 0, output } });

const limited = (resetAt?: string) =>
  `${usage(10, 5)}${line({ kind: "quota", message: "limit", ...(resetAt ? { resetAt } : {}) })}${line({ kind: "failure", message: "usage limit reached" })}process.exit(1);`;

const overloaded = `${line({ kind: "failure", message: "API overloaded" })}process.exit(1);`;

function candidate(
  name: string,
  script: string | ((input: AgentInput) => string),
  inputs: AgentInput[] = [],
): CliAgent {
  return {
    ...scripted((input) => {
      inputs.push(input);
      return typeof script === "function" ? script(input) : script;
    }),
    name,
    quota: (text) => /usage limit/.test(text),
    unavailable: (text) => /overloaded/.test(text),
  };
}

async function session(
  t: TestContext,
  agent: CliAgent | ReturnType<typeof fallbackAgent>,
) {
  const root = await repository(t);
  const sandbox = await createSandbox({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent,
    logging: false,
  });
  t.after(() => sandbox.close());
  return sandbox;
}

const pair = (
  first: CliAgent,
  second: CliAgent,
  on: readonly FallbackTrigger[] = ["quota", "unavailable"],
) => fallbackAgent([first, second], { on });

test("a quota failure hands the dispatch to the next candidate in the same workspace", async (t) => {
  const second: AgentInput[] = [];
  const primary = candidate(
    "primary",
    `const fs = await import("node:fs"); fs.writeFileSync("partial.txt", "draft");${limited("2026-10-01T00:00:00.000Z")}`,
  );
  const backup = candidate(
    "backup",
    `const fs = await import("node:fs");${usage(3, 2)}${line({ kind: "conversation", id: "backup-1" })}console.log(JSON.stringify({ kind: "text", text: "saw " + fs.readFileSync("partial.txt", "utf8") }));`,
    second,
  );
  const sandbox = await session(t, pair(primary, backup));
  const events: AgentObservation[] = [];
  const result = await sandbox.dispatch({
    brief: { text: "implement" },
    observe: (event) => events.push(event),
  });
  assert.equal(result.text, "saw draft");
  assert.equal(second[0]!.text, "implement");
  assert.deepEqual(result.fallback, {
    selected: { index: 1, name: "backup" },
    attempts: [
      {
        index: 0,
        name: "primary",
        failure: "quota",
        message: "usage limit reached",
        resetAt: "2026-10-01T00:00:00.000Z",
      },
    ],
  });
  assert.deepEqual(
    { input: result.usage.input, output: result.usage.output },
    { input: 13, output: 7 },
  );
  const fallback = events.find((event) => event.kind === "fallback");
  assert.ok(fallback && fallback.kind === "fallback");
  assert.deepEqual(fallback.from, { index: 0, name: "primary" });
  assert.deepEqual(fallback.to, { index: 1, name: "backup" });
  assert.equal(fallback.pass, 1);
  const backupPrompt = events.filter((event) => event.kind === "prompt");
  assert.deepEqual(
    backupPrompt.map((event) => event.pass),
    [1, 2],
  );
});

test("an outage falls back only when the policy covers it", async (t) => {
  const covered = await session(
    t,
    pair(candidate("primary", overloaded), candidate("backup", emit("ok")), [
      "unavailable",
    ]),
  );
  const result = await covered.dispatch({ brief: { text: "go" } });
  assert.equal(result.text, "ok");
  assert.equal(result.fallback?.attempts[0]?.failure, "unavailable");
  assert.equal(result.fallback?.attempts[0]?.message, "API overloaded");

  const ran: AgentInput[] = [];
  const uncovered = await session(
    t,
    pair(
      candidate("primary", limited()),
      candidate("backup", emit("ok"), ran),
      ["unavailable"],
    ),
  );
  await assert.rejects(
    uncovered.dispatch({ brief: { text: "go" } }),
    (error) => quotaFault(error) !== undefined,
  );
  assert.equal(ran.length, 0);
});

test("unclassified failures and cancellations never fall back", async (t) => {
  const ran: AgentInput[] = [];
  const crashing = await session(
    t,
    pair(
      candidate(
        "primary",
        `${line({ kind: "failure", message: "compile error" })}process.exit(1);`,
      ),
      candidate("backup", emit("ok"), ran),
    ),
  );
  await assert.rejects(
    crashing.dispatch({ brief: { text: "go" } }),
    (error) =>
      error instanceof OutpostError &&
      error.code === "process" &&
      Array.isArray(recoveryDetails(error)?.fallback),
  );

  const controller = new AbortController();
  const cancelled = await session(
    t,
    pair(
      candidate("primary", () => {
        controller.abort();
        return limited();
      }),
      candidate("backup", emit("ok"), ran),
    ),
  );
  await assert.rejects(
    cancelled.dispatch({ brief: { text: "go" }, signal: controller.signal }),
  );
  assert.equal(ran.length, 0);
});

test("exhausting every candidate on quota reports the earliest known reset", async (t) => {
  const early = "2026-10-01T00:00:00.000Z";
  const late = "2026-10-02T00:00:00.000Z";
  const known = await session(
    t,
    pair(
      candidate("primary", limited(late)),
      candidate("backup", limited(early)),
    ),
  );
  await assert.rejects(known.dispatch({ brief: { text: "go" } }), (error) => {
    assert.ok(error instanceof OutpostError);
    assert.equal(error.code, "quota");
    assert.equal(quotaFault(error)?.resetAt, early);
    assert.equal(quotaFault(error)?.conversation, undefined);
    assert.match(error.message, /Every fallback candidate/);
    assert.equal((recoveryDetails(error)?.fallback as unknown[]).length, 2);
    assert.equal(typeof recoveryDetails(error)?.branch, "string");
    return true;
  });
  const unknown = await session(
    t,
    pair(candidate("primary", limited()), candidate("backup", limited(early))),
  );
  await assert.rejects(
    unknown.dispatch({ brief: { text: "go" } }),
    (error) =>
      quotaFault(error) !== undefined &&
      quotaFault(error)?.resetAt === undefined,
  );
  const mixed = await session(
    t,
    pair(candidate("primary", limited(early)), candidate("backup", overloaded)),
  );
  await assert.rejects(
    mixed.dispatch({ brief: { text: "go" } }),
    (error) =>
      quotaFault(error) === undefined &&
      unavailableFault(error)?.message === "API overloaded",
  );
});

test("resume continues with the candidate that produced the result", async (t) => {
  const backupInputs: AgentInput[] = [];
  const store = await mkdtemp(join(tmpdir(), "outpost-fallback-"));
  t.after(() => rm(store, { recursive: true, force: true }));
  const file = join(store, "backup.jsonl");
  const storage: ConversationStore = {
    name: "fallback-store",
    locate: async (id) => ({ id, file, format: "custom" }),
    async capture(id) {
      await writeFile(file, "native data");
      return { id, file, format: "custom" };
    },
    async restore() {},
  };
  const backup: CliAgent = {
    ...candidate(
      "backup",
      (input) =>
        `${line({ kind: "conversation", id: "backup-1" })}${emit(input.continuation ? "resumed" : "first")}`,
      backupInputs,
    ),
    storage,
  };
  const primaryInputs: AgentInput[] = [];
  const agent = pair(candidate("primary", limited(), primaryInputs), backup);
  const sandbox = await session(t, agent);
  const result = await sandbox.dispatch({ brief: { text: "go" } });
  const resumed = await result.resume({ brief: { text: "more" } });
  assert.equal(resumed.text, "resumed");
  assert.deepEqual(backupInputs[1]!.continuation, { id: "backup-1" });
  assert.equal(primaryInputs.length, 1);

  const root = await repository(t);
  const cold = await dispatch({
    repository: root,
    sandboxProvider: localSandboxProvider(),
    agent,
    logging: false,
    brief: { text: "go" },
  });
  assert.equal(cold.fallback?.selected.name, "backup");
  const next = await cold.resume({ brief: { text: "more" } });
  assert.equal(next.text, "resumed");
  assert.equal(next.fallback, undefined);
});

test("continuations and interactive attachment reject fallback agents", async (t) => {
  const agent = pair(
    candidate("primary", emit("a")),
    candidate("backup", emit("b")),
  );
  const sandbox = await session(t, agent);
  await assert.rejects(
    sandbox.resume("conversation", { brief: { text: "go" } }),
    /Fallback agents cannot continue a conversation/,
  );
  await assert.rejects(
    sandbox.attach({ brief: { text: "go" } }),
    /fallback agents only apply to dispatch/,
  );
  const root = await repository(t);
  await assert.rejects(
    dispatch({
      repository: root,
      sandboxProvider: localSandboxProvider(),
      agent,
      logging: false,
      brief: { text: "go" },
      continuation: { id: "conversation" },
    }),
    /Fallback agents cannot continue a conversation/,
  );
});

test("agentTask counts the usage of failed candidates in the workflow", async (t) => {
  const sandbox = await session(
    t,
    pair(
      candidate("primary", limited()),
      candidate("backup", `${usage(3, 2)}${emit("done")}`),
    ),
  );
  const coder = agentTask({
    key: "coder",
    sandbox,
    request: () => ({ brief: { text: "implement" } }),
  });
  const result = await workflow("fallback", [coder]).start();
  result.unwrap();
  assert.equal(result.usage.tokens.input, 13);
  assert.equal(result.usage.tokens.output, 7);
  assert.equal(result.value(coder).fallback?.selected.name, "backup");
});

test("conversations of failed candidates are captured for recovery", async (t) => {
  const captured: string[] = [];
  const store = await mkdtemp(join(tmpdir(), "outpost-fallback-"));
  t.after(() => rm(store, { recursive: true, force: true }));
  const storage: ConversationStore = {
    name: "fallback-store",
    locate: async (id) => ({ id, file: join(store, id), format: "custom" }),
    async capture(id) {
      captured.push(id);
      await writeFile(join(store, id), "native data");
      return { id, file: join(store, id), format: "custom" };
    },
    async restore() {},
  };
  const primary: CliAgent = {
    ...candidate(
      "primary",
      `${line({ kind: "conversation", id: "primary-1" })}${limited()}`,
    ),
    storage,
  };
  const sandbox = await session(
    t,
    pair(primary, candidate("backup", emit("ok"))),
  );
  const result = await sandbox.dispatch({ brief: { text: "go" } });
  assert.equal(result.text, "ok");
  assert.deepEqual(captured, ["primary-1"]);
});
