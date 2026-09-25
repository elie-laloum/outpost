import assert from "node:assert/strict";
import { test } from "node:test";
import { createReporter } from "../../src/index.ts";
import type { AgentObservation, ReporterHandlers } from "../../src/index.ts";

const text = (value: string): AgentObservation => ({
  kind: "text",
  text: value,
  pass: 1,
  at: new Date().toISOString(),
});

test("reporter routes typed events and serializes asynchronous handlers", async () => {
  const output: string[] = [];
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const report = createReporter({
    async phase(event) {
      output.push(event.name);
      await gate;
      output.push("ready");
    },
    text(event) {
      output.push(event.text);
    },
    tool(event) {
      output.push(event.name);
    },
  });
  report({ kind: "phase", name: "running", pass: 2, at: "now" });
  report(text("hello"));
  report({ kind: "tool", name: "read", input: {}, pass: 2, at: "now" });
  report({ kind: "finished", pass: 2, at: "now" });
  await Promise.resolve();
  assert.deepEqual(output, ["running"]);
  release();
  await report.flush();
  assert.deepEqual(output, ["running", "ready", "hello", "read"]);
  report(text("again"));
  await report.flush();
  assert.equal(output.at(-1), "again");
});

test("reporter drains after failures and retains the first failure for every flush", async () => {
  const failure = new Error("write failed");
  const diagnostics: unknown[] = [];
  const output: string[] = [];
  const report = createReporter(
    {
      text(event) {
        if (event.text === "fail") throw failure;
        output.push(event.text);
      },
      async tool() {
        throw new Error("second failure");
      },
    },
    {
      async onError(error, event) {
        diagnostics.push([error, event.kind]);
        throw new Error("diagnostic failed");
      },
    },
  );
  report(text("fail"));
  report({ kind: "tool", name: "read", input: null, pass: 1, at: "now" });
  report(text("retained"));
  await assert.rejects(report.flush(), (error) => error === failure);
  assert.deepEqual(output, ["retained"]);
  assert.equal(diagnostics.length, 2);
  report(text("later"));
  await assert.rejects(report.flush(), (error) => error === failure);
  assert.equal(output.at(-1), "later");
});

test("flush waits for its snapshot without waiting for later events", async () => {
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const report = createReporter({
    async text(event) {
      if (event.text === "late") await gate;
    },
  });
  report(text("early"));
  const drained = report.flush();
  report(text("late"));
  await drained;
  release();
  await report.flush();
  await createReporter({}).flush();
});

test("undefined rejections are still failures and handlers narrow the event", async () => {
  const handlers: ReporterHandlers = {
    phase(event) {
      assert.equal(event.pass, 1);
      // @ts-expect-error Phase events do not have text.
      void event.text;
      throw undefined;
    },
  };
  const report = createReporter(handlers);
  report({ kind: "phase", name: "running", pass: 1, at: "now" });
  let rejected = false;
  await report.flush().catch((error: unknown) => {
    rejected = true;
    assert.equal(error, undefined);
  });
  assert.equal(rejected, true);
});
