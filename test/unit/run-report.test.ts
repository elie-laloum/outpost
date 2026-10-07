import assert from "node:assert/strict";
import { test } from "node:test";
import { createRunReportEvents } from "../../src/application/run-report-events.ts";
import {
  createRunReport,
  runReportSnapshot,
  collectRunReportDiff,
} from "../../src/application/run-report.ts";
import type { RunReport, Observation, AgentEvent } from "../../src/index.ts";

const empty: RunReport = {
  version: 1,
  completed: false,
  text: "",
  branch: "main",
  commits: [],
  durationMs: 500,
  usage: { input: 0, cached: 0, output: 0 },
  cost: null,
  diff: null,
  failedTools: [],
  omittedFailures: 0,
  warnings: [],
};
const observation = (event: AgentEvent): Observation => ({
  seq: 1,
  at: "2026-10-07T00:00:00Z",
  source: "agent",
  scope: {},
  event,
});

test("report renders unavailable and partial data honestly and snapshots caller data", () => {
  const report = createRunReport(empty);
  assert.match(report(), /Diff statistics unavailable/);
  assert.match(report(), /No final answer recorded/);
  assert.match(report(), /not satisfied/);
  assert.throws(() => report({ format: "xml" as "json" }), /format/);
  assert.equal(
    runReportSnapshot(() => ""),
    undefined,
  );
  const snapshot = runReportSnapshot(report)!;
  Object.assign(snapshot, { text: "mutated" });
  assert.equal(JSON.parse(report({ format: "json" })).text, "");
  const partial = createRunReport({
    ...empty,
    text: "<script>alert('x')</script>\n| forge |",
    usage: { ...empty.usage, complete: false },
    cost: { amount: 0.1, currency: "USD", complete: false },
    omittedFailures: 5,
    warnings: ["<unsafe>"],
    failedTools: [
      { tool: "mcp", command: null, preview: "", pass: null, subagentId: null },
    ],
  });
  assert.match(partial(), /partial/);
  assert.match(partial(), /Token accounting is incomplete/);
  assert.match(partial(), /5 additional failures omitted/);
  assert.ok(!partial().includes("<script>"));
  assert.ok(!partial().includes("| forge |"));
  assert.match(partial(), /Collection warnings/);
});

test("bounded event collection preserves counts and marks missing tool descriptions", () => {
  const events = createRunReportEvents();
  events.observe(observation({ kind: "text", text: "ignored" }));
  events.observe(observation({ kind: "tool", name: "ignored", input: "" }));
  for (let index = 0; index < 513; index++)
    events.observe(
      observation({
        kind: "tool",
        name: "shell",
        callId: String(index),
        input: { command: "x".repeat(5000) },
      }),
    );
  for (let index = 0; index < 105; index++)
    events.observe(
      observation({
        kind: "tool-result",
        name: "shell",
        callId: String(index),
        isError: true,
        preview: "y".repeat(5000),
        characters: 5000,
      }),
    );
  assert.equal(events.failures.length, 100);
  assert.equal(events.omittedFailures, 5);
  assert.equal(events.failures[0]?.command, null);
  assert.equal(events.failures[1]?.command?.length, 4096);
  assert.equal(events.failures[1]?.preview.length, 4096);
  assert.equal(events.warnings.length, 2);
});

test("successful results clear descriptions and unknown inputs stay unavailable", () => {
  const events = createRunReportEvents();
  for (const input of [
    null,
    3,
    {},
    { command: 3 },
    { cmd: "value" },
    "string",
  ]) {
    events.observe(
      observation({ kind: "tool", name: "", callId: "id", input }),
    );
    events.observe(
      observation({
        kind: "tool-result",
        name: "",
        callId: "id",
        isError: true,
        preview: "",
        characters: 0,
      }),
    );
  }
  assert.deepEqual(
    events.failures.map((failure) => failure.command),
    [null, null, null, null, "value", "string"],
  );
  assert.equal(events.failures[0]?.tool, "unknown");
  events.observe(
    observation({
      kind: "tool",
      name: "shell",
      callId: "success",
      input: "old",
    }),
  );
  events.observe(
    observation({
      kind: "tool-result",
      name: "shell",
      callId: "success",
      isError: false,
      preview: "",
      characters: 0,
    }),
  );
  events.observe(
    observation({
      kind: "tool-result",
      name: "shell",
      callId: "success",
      isError: true,
      preview: "",
      characters: 0,
    }),
  );
  assert.equal(events.failures.at(-1)?.command, null);
});

test("unavailable Git statistics reject collection rather than fabricate an empty diff", async () => {
  await assert.rejects(
    collectRunReportDiff("/nonexistent-outpost-report", "HEAD", "HEAD"),
  );
});

test("Markdown keeps paths and commands readable while fencing embedded markup", () => {
  const report = createRunReport({
    ...empty,
    branch: "outpost/run-report",
    diff: {
      baseline: "base",
      head: "head",
      filesChanged: 1,
      added: 1,
      removed: 0,
      binaryFiles: 0,
      files: [
        { paths: ["src/a|`file.ts"], added: 1, removed: 0, binary: false },
      ],
    },
    failedTools: [
      {
        tool: "shell",
        command: "printf '<script>`tick`</script>'",
        preview: "failure\n```\n<script>alert(1)</script>\n```",
        pass: 1,
        subagentId: "child",
      },
    ],
  });
  const markdown = report();
  assert.match(markdown, /` outpost\/run-report `/);
  assert.ok(markdown.includes("`` src/a\\|`file.ts ``"));
  assert.ok(markdown.includes("`` printf '<script>`tick`</script>' ``"));
  assert.ok(markdown.includes("  ````text\n"));
  assert.ok(markdown.includes("  ````\n"));
});
