import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, mkdir, rm, writeFile, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createAgent,
  createCopilotHarness,
  createKimiHarness,
  type Usage,
  type AgentObservation,
} from "../../src/index.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { agentOutput } from "../../src/application/agent-output.ts";
import {
  sessionUsageCommand,
  sessionUsageResult,
} from "../../src/adapters/agents/session-usage.ts";
import {
  sessionUsageLimits,
  sessionUsageScript,
} from "../../src/adapters/agents/session-usage.constants.ts";
import { kimiUsage } from "../../src/adapters/agents/kimi-usage.ts";

const copilotCounts = {
  inputTokens: 12,
  outputTokens: 3,
  cacheReadTokens: 4,
  cacheWriteTokens: 2,
};
const kimiCounts = {
  inputOther: 12,
  output: 3,
  inputCacheRead: 4,
  inputCacheCreation: 2,
};
const expected: Usage = { input: 12, output: 3, cached: 4, cacheCreated: 2 };

test("Copilot decodes model usage and reconciles repeated session totals without double counting", () => {
  const adapter = createAgent({ harness: createCopilotHarness() });
  const observed: AgentObservation[] = [];
  const output = agentOutput(
    adapter,
    { brief: { text: "" }, observe: (event) => observed.push(event) },
    [],
    1,
  );
  output.append(
    JSON.stringify({ type: "assistant.usage", data: copilotCounts }) + "\n",
  );
  const shutdown = JSON.stringify({
    type: "session.shutdown",
    data: {
      modelMetrics: {
        first: { usage: copilotCounts },
        second: { usage: copilotCounts },
      },
    },
  });
  output.append(shutdown + "\n" + shutdown + "\n");
  output.append(
    JSON.stringify({
      type: "result",
      exitCode: 0,
      usage: { premiumRequests: 9 },
    }),
  );
  output.flush();
  assert.deepEqual(output.result().usage, {
    input: 24,
    output: 6,
    cached: 8,
    cacheCreated: 4,
  });
  assert.equal(
    observed
      .filter((event) => event.kind === "usage")
      .reduce((sum, event) => sum + event.tokens.input, 0),
    24,
  );
  assert.equal(output.finalUsage, true);
});

test("absent, invalid and partial counters remain explicitly incomplete while real zeros are valid", () => {
  for (const bad of [
    undefined,
    -1,
    0.5,
    NaN,
    Infinity,
    Number.MAX_SAFE_INTEGER + 1,
    "12",
  ]) {
    const usage = kimiUsage({ ...kimiCounts, inputOther: bad });
    assert.deepEqual(usage, { ...expected, input: 0, complete: false });
  }
  assert.deepEqual(
    kimiUsage({
      inputOther: 0,
      output: 0,
      inputCacheRead: 0,
      inputCacheCreation: 0,
    }),
    {
      input: 0,
      cached: 0,
      cacheCreated: 0,
      output: 0,
    },
  );
  assert.equal(sessionUsageResult("invalid", kimiUsage), undefined);
  assert.equal(
    sessionUsageResult('{"records":[]}', kimiUsage)?.complete,
    false,
  );
  const copilot = createAgent({ harness: createCopilotHarness() });
  assert.deepEqual(
    copilot.events(
      '{"type":"result","exitCode":0,"usage":{"premiumRequests":5}}',
    ),
    [{ kind: "finished" }],
  );
  assert.equal(copilot.events('{"type":"session.shutdown"}')[0]?.kind, "usage");
});

for (const kind of ["copilot", "kimi"] as const) {
  test(`${kind} reads only session counters inside the execution environment`, async (t) => {
    const home = await mkdtemp(join(tmpdir(), "outpost-usage-"));
    t.after(() => rm(home, { recursive: true, force: true }));
    const adapter = createAgent({
      harness:
        kind === "copilot" ? createCopilotHarness() : createKimiHarness(),
    });
    const session = "session_fixture";
    const path =
      kind === "copilot"
        ? join(home, "session-state", session, "events.jsonl")
        : join(
            home,
            "sessions",
            "workspace",
            session,
            "agents",
            "main",
            "wire.jsonl",
          );
    await mkdir(join(path, ".."), { recursive: true });
    const record =
      kind === "copilot"
        ? {
            type: "session.shutdown",
            data: { modelMetrics: { model: { usage: copilotCounts } } },
          }
        : {
            type: "usage.record",
            agentId: "main",
            model: "test",
            usage: kimiCounts,
          };
    await writeFile(
      path,
      [
        JSON.stringify({
          type: "assistant.message",
          content: "private transcript",
        }),
        JSON.stringify(record),
        "",
      ].join("\n"),
    );
    const command = adapter.usageCommand!(session)!;
    const result = await executeProcess({
      ...command,
      variables: {
        [kind === "copilot" ? "COPILOT_HOME" : "KIMI_CODE_HOME"]: home,
      },
    });
    assert.equal(result.status, 0);
    assert.doesNotMatch(result.stdout, /private transcript/);
    assert.deepEqual(adapter.usageResult!(result.stdout), expected);
    if (kind === "kimi") {
      const child = join(path, "..", "..", "child", "wire.jsonl");
      await mkdir(join(child, ".."), { recursive: true });
      await writeFile(child, JSON.stringify(record) + "\n");
      const children = await executeProcess({
        ...command,
        variables: { KIMI_CODE_HOME: home },
      });
      assert.deepEqual(adapter.usageResult!(children.stdout), {
        input: 24,
        output: 6,
        cached: 8,
        cacheCreated: 4,
      });
      await writeFile(child, "malformed\n");
      const partial = await executeProcess({
        ...command,
        variables: { KIMI_CODE_HOME: home },
      });
      assert.equal(adapter.usageResult!(partial.stdout)?.complete, false);
    }
    await rm(path);
    const missing = await executeProcess({
      ...command,
      variables: {
        [kind === "copilot" ? "COPILOT_HOME" : "KIMI_CODE_HOME"]: home,
      },
    });
    assert.equal(adapter.usageResult!(missing.stdout)?.complete, false);
    if (process.platform === "win32") return;
    const outside = join(home, "unrelated.jsonl");
    await writeFile(outside, JSON.stringify(record));
    await symlink(outside, path);
    const linked = await executeProcess({
      ...command,
      variables: {
        [kind === "copilot" ? "COPILOT_HOME" : "KIMI_CODE_HOME"]: home,
      },
    });
    assert.equal(adapter.usageResult!(linked.stdout)?.complete, false);
    assert.doesNotMatch(linked.stdout, /inputTokens|inputOther/);
  });
}

test("session readers reject traversal and bound oversized input", async (t) => {
  assert.equal(sessionUsageCommand("kimi", "../../secret"), undefined);
  const home = await mkdtemp(join(tmpdir(), "outpost-usage-limit-"));
  t.after(() => rm(home, { recursive: true, force: true }));
  const path = join(home, "session-state", "fixture", "events.jsonl");
  await mkdir(join(path, ".."), { recursive: true });
  await writeFile(path, "x".repeat(200));
  for (const limits of [
    { ...sessionUsageLimits, bytes: 100 },
    { ...sessionUsageLimits, lineBytes: 100 },
  ]) {
    const result = await executeProcess({
      executable: process.execPath,
      arguments: [
        "-e",
        sessionUsageScript,
        "copilot",
        "fixture",
        JSON.stringify(limits),
      ],
      variables: { COPILOT_HOME: home },
    });
    assert.deepEqual(JSON.parse(result.stdout), {
      records: [],
      complete: false,
    });
  }
});

test("a failed session read cannot turn partial streamed usage into complete accounting", async () => {
  const { collectAgentUsage } =
    await import("../../src/application/agent-usage.ts");
  const adapter = createAgent({ harness: createCopilotHarness() });
  const options = { brief: { text: "fixture" } };
  for (const scenario of ["throw", "nonzero", "invalid", "no-id"] as const) {
    const output = agentOutput(adapter, options, [], 1);
    output.append(
      JSON.stringify({ type: "assistant.usage", data: copilotCounts }) + "\n",
    );
    if (scenario !== "no-id")
      output.append(
        '{"type":"result","exitCode":0,"sessionId":"session_fixture"}\n',
      );
    const lease = {
      root: "/fixture",
      home: "/fixture/home",
      async invoke() {
        if (scenario === "throw") throw new Error("reader unavailable");
        return {
          status: scenario === "nonzero" ? 7 : 0,
          stdout: "not-json",
          stderr: "",
        };
      },
      async upload() {},
      async download() {},
      async release() {},
    };
    await collectAgentUsage(lease, adapter, output, options, 1, true);
    assert.deepEqual(output.usage, { ...expected, complete: false });
  }
});

test("resumed session totals exclude prior usage and an unknown fork baseline never bills inherited tokens", async () => {
  const { prepareAgentUsage } =
    await import("../../src/application/agent-usage.ts");
  const adapter = createAgent({ harness: createCopilotHarness() });
  const lease = {
    root: "/fixture",
    home: "/fixture/home",
    async invoke() {
      return {
        status: 0,
        stdout: JSON.stringify({ records: [copilotCounts], complete: true }),
        stderr: "",
      };
    },
    async upload() {},
    async download() {},
    async release() {},
  };
  for (const fork of [false, true]) {
    const output = agentOutput(adapter, { brief: { text: "fixture" } }, [], 1);
    await prepareAgentUsage(
      lease,
      adapter,
      output,
      { id: "session_fixture", fork },
      new AbortController().signal,
    );
    output.recordUsage(
      { input: 20, output: 5, cached: 6, cacheCreated: 3 },
      true,
    );
    assert.deepEqual(
      output.usage,
      fork
        ? { input: 0, output: 0, cached: 0, complete: false }
        : { input: 8, output: 2, cached: 2, cacheCreated: 1 },
    );
  }
});
