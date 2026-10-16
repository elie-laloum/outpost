import assert from "node:assert/strict";
import { test } from "node:test";
import { cliSteering } from "../../src/application/cli-steering.ts";
import { claudeLiveInput } from "../../src/adapters/agents/claude/claude-input.ts";
import { createSteering, steeringChannel } from "../../src/domain/steering.ts";
import { reportInputFailure } from "../../src/infrastructure/input-failure.ts";
import type { AgentObservation } from "../../src/domain/agent.types.ts";

test("live steering receipts wait for native acknowledgements and reject delivery failures independently of the turn", async () => {
  const steering = createSteering();
  const release = steeringChannel(steering).open();
  const events: AgentObservation[] = [];
  const live = cliSteering(
    {
      name: "claude",
      liveInput: claudeLiveInput,
      request: () => ({ executable: "claude" }),
      events: () => [],
    },
    {
      root: "/workspace",
      home: "/home/agent",
      liveInput: true,
      invoke: async () => ({ status: 0, stdout: "", stderr: "" }),
      upload: async () => {},
      download: async () => {},
      release: async () => {},
    },
    {
      brief: { text: "initial" },
      steering,
      observe: (event) => events.push(event),
    },
    1,
    {
      completed: () => false,
      conversation: () => undefined,
      interrupt: () => assert.fail("must not interrupt"),
    },
  );
  const input = live.command({ executable: "claude" }).input!;
  input.resume();
  live.start({ text: "initial", liveInput: true });
  const acknowledge = () =>
    live.observe({
      kind: "raw",
      value: JSON.stringify({ type: "user", isReplay: true }),
      pass: 1,
      at: new Date().toISOString(),
    });
  try {
    let delivered = false;
    const receipt = steering.send("first").then((value) => {
      delivered = true;
      return value;
    });
    await Promise.resolve();
    assert.equal(delivered, false);
    acknowledge();
    await Promise.resolve();
    assert.equal(
      delivered,
      false,
      "initial prompt acknowledgement is not a steering receipt",
    );
    acknowledge();
    assert.deepEqual(await receipt, { mode: "injected" });
    const refused = assert.rejects(
      steering.send("second"),
      /delivery could not be confirmed/,
    );
    assert.equal(reportInputFailure(input, new Error("append failed")), true);
    await refused;
    assert.equal(
      input.readableEnded,
      false,
      "the active turn keeps stdin until completion",
    );
    await assert.rejects(
      steering.send("third"),
      /delivery could not be confirmed/,
    );
    assert.equal(events.filter((event) => event.kind === "steer").length, 1);
    live.observe({ kind: "finished", pass: 1, at: new Date().toISOString() });
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(input.readableEnded, true);
  } finally {
    live.close();
    release();
  }
  assert.equal(reportInputFailure(input, new Error("late failure")), false);
});

test("ending a live turn rejects instructions the agent did not acknowledge", async () => {
  for (const ending of ["turn", "controller"]) {
    const steering = createSteering();
    const live = cliSteering(
      {
        name: "claude",
        liveInput: claudeLiveInput,
        request: () => ({ executable: "claude" }),
        events: () => [],
      },
      {
        root: "/workspace",
        home: "/home/agent",
        liveInput: true,
        invoke: async () => ({ status: 0, stdout: "", stderr: "" }),
        upload: async () => {},
        download: async () => {},
        release: async () => {},
      },
      { brief: { text: "initial" }, steering },
      1,
      {
        completed: () => false,
        conversation: () => undefined,
        interrupt: () => {},
      },
    );
    live.start({ text: "initial", liveInput: true });
    const refused = assert.rejects(
      steering.send("pending"),
      /before live input was acknowledged/,
    );
    if (ending === "controller") steering.close();
    else live.close();
    await refused;
    live.close();
  }
});
