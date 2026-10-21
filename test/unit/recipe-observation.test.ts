import assert from "node:assert/strict";
import { test } from "node:test";
import { setImmediate } from "node:timers/promises";
import { metrics, SpanStatusCode } from "@opentelemetry/api";
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { createObservation } from "../../src/infrastructure/observation-client.ts";
import { createRecipeRegistry } from "../../src/recipes.ts";
import {
  nativeRecipeComponents,
  nativeRecipeGuards,
} from "../../src/application/recipes/native.ts";
import type { ObservationSink } from "../../src/domain/observation.types.ts";
import type { AgentObservation } from "../../src/domain/agent.types.ts";

function isSink(value: unknown): value is ObservationSink {
  return nativeRecipeGuards.sink!(value);
}

async function recipeSink(
  name: string,
  options: Readonly<Record<string, unknown>>,
  bindings: Readonly<Record<string, unknown>>,
) {
  const definition = createRecipeRegistry({
    components: nativeRecipeComponents,
  }).get(`sink.${name}`);
  const sink = await definition.create(options, {
    directory: process.cwd(),
    signal: new AbortController().signal,
    kindOf: (name) =>
      typeof bindings[name] === "function" ? "callback" : "object",
    async resolve(name) {
      assert.ok(Object.hasOwn(bindings, name), `Unknown binding: ${name}`);
      return bindings[name];
    },
    environment: () => assert.fail("Unexpected secret resolution"),
  });
  assert.ok(definition.accepts(sink));
  assert.ok(isSink(sink));
  return { sink, close: () => definition.dispose?.(sink) };
}

test("recipe reporter keeps interleaved dispatch, pass and subagent streams independent", async () => {
  const output: string[] = [];
  const { sink } = await recipeSink(
    "reporter",
    { write: { $ref: "write" } },
    { write: (text: string) => output.push(text) },
  );
  await using observation = createObservation({ sinks: [sink] });
  const first = observation.child({ dispatchId: "first", pass: 1 });
  const second = observation.child({ dispatchId: "second", pass: 1 });
  first.emit("agent", { kind: "text-delta", text: "alpha" });
  second.emit("agent", { kind: "text", text: "beta" });
  first.child({ pass: 2 }).emit("agent", { kind: "text", text: "gamma" });
  first
    .child({ subagentId: "child" })
    .emit("agent", { kind: "text", text: "delta" });
  first.emit("agent", { kind: "text", text: "alpha" });
  await observation.flush();
  assert.equal(output.join(""), "alphabetagammadelta");
  assert.deepEqual(observation.errors, []);
});

test("recipe custom reporter flush waits for asynchronous handlers and retains pass metadata", async (t) => {
  let enter!: () => void;
  let release!: () => void;
  const entered = new Promise<void>((resolve) => {
    enter = resolve;
  });
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  const events: AgentObservation[] = [];
  const reporter = await recipeSink(
    "custom",
    { handlers: { text: { $ref: "text" } } },
    {
      text: async (event: AgentObservation) => {
        enter();
        await released;
        events.push(event);
      },
    },
  );
  t.after(() => reporter.close());
  await using observation = createObservation({ sinks: [reporter.sink] });
  observation
    .child({ dispatchId: "first", pass: 2 })
    .emit("agent", { kind: "text", text: "hello" });
  let flushed = false;
  const flushing = observation.flush().then(() => {
    flushed = true;
  });
  await entered;
  try {
    await setImmediate();
    assert.equal(flushed, false);
  } finally {
    release();
    await flushing;
  }
  assert.partialDeepStrictEqual(events, [
    { kind: "text", text: "hello", pass: 2 },
  ]);
  assert.deepEqual(observation.errors, []);
});

test("recipe custom reporter disposal drains handlers and reports their failures", async () => {
  const failure = new Error("handler failed");
  const reporter = await recipeSink(
    "custom",
    { handlers: { text: { $ref: "text" } } },
    {
      text: async () => {
        await setImmediate();
        throw failure;
      },
    },
  );
  reporter.sink.observe({
    seq: 1,
    at: new Date().toISOString(),
    source: "agent",
    scope: {},
    event: { kind: "text", text: "hello" },
  });
  await assert.rejects(
    async () => reporter.close(),
    (error) => error === failure,
  );
});

test("recipe OpenTelemetry disposal closes pending workflow, dispatch and operation spans once", async (t) => {
  const spans = new InMemorySpanExporter();
  const provider = new BasicTracerProvider({
    spanProcessors: [new SimpleSpanProcessor(spans)],
  });
  t.after(() => provider.shutdown());
  const reporter = await recipeSink(
    "opentelemetry",
    { tracer: { $ref: "tracer" }, meter: { $ref: "meter" } },
    { tracer: provider.getTracer("recipe"), meter: metrics.getMeter("recipe") },
  );
  t.after(() => reporter.close());
  const observation = createObservation({ sinks: [reporter.sink] });
  t.after(() => observation.close());
  const scoped = observation.child({
    executionId: "workflow",
    dispatchId: "dispatch",
  });
  scoped.emit("workflow", {
    kind: "workflow",
    event: {
      type: "start",
      workflow: "recipe",
      executionId: "workflow",
      timestamp: new Date().toISOString(),
    },
  });
  scoped.emit("agent", { kind: "dispatch-start" });
  scoped.emit("sandbox", {
    kind: "operation",
    id: "operation",
    name: "prepare",
    status: "started",
  });
  await observation.close();
  assert.equal(spans.getFinishedSpans().length, 0);
  await reporter.close();
  await reporter.close();
  await provider.forceFlush();
  const finished = spans.getFinishedSpans();
  assert.deepEqual(finished.map((span) => span.name).sort(), [
    "outpost.dispatch",
    "outpost.prepare",
    "outpost.workflow",
  ]);
  assert.ok(
    finished.every((span) => span.status.code === SpanStatusCode.ERROR),
  );
  const workflow = finished.find((span) => span.name === "outpost.workflow")!;
  const dispatch = finished.find((span) => span.name === "outpost.dispatch")!;
  const operation = finished.find((span) => span.name === "outpost.prepare")!;
  assert.equal(
    dispatch.parentSpanContext?.spanId,
    workflow.spanContext().spanId,
  );
  assert.equal(
    operation.parentSpanContext?.spanId,
    dispatch.spanContext().spanId,
  );
});
