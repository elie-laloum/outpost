import { test } from "node:test";
import assert from "node:assert/strict";
import { createSteering, OutpostError } from "../../src/index.ts";
import {
  mainLoopSteering,
  steeringChannel,
  steeringInbox,
  subagentSteering,
} from "../../src/domain/steering.ts";

test("steering queues messages until a dispatch delivers them", async () => {
  const steering = createSteering();
  assert.equal(steering.state, "idle");
  const sent = steering.send("Keep the public API stable.");
  const release = steeringChannel(steering).open();
  assert.equal(steering.state, "active");
  const inbox = steeringInbox(steering)!;
  assert.equal(inbox.count(), 1);
  const [message] = inbox.take();
  assert.equal(message?.text, "Keep the public API stable.");
  assert.equal(inbox.count(), 0);
  message!.deliver({ mode: "injected" });
  assert.deepEqual(await sent, { mode: "injected" });
  release();
  assert.equal(steering.state, "idle");
});

test("steering notifies subscribers and rejects messages its dispatch did not deliver", async () => {
  const steering = createSteering();
  const release = steeringChannel(steering).open();
  let notified = 0;
  const unsubscribe = steeringInbox(steering)!.subscribe(() => notified++);
  const late = steering.send("Too late");
  assert.equal(notified, 1);
  unsubscribe();
  release();
  release();
  await assert.rejects(
    late,
    (error: unknown) =>
      error instanceof OutpostError &&
      error.code === "steering" &&
      error.details.text === "Too late",
  );
  const next = steering.send("For the next dispatch");
  const again = steeringChannel(steering).open();
  assert.equal(steeringInbox(steering)!.count(), 1);
  again();
  await assert.rejects(next, /dispatch ended/);
});

test("steering refuses concurrent attachment, invalid text and use after close", async () => {
  const steering = createSteering();
  const release = steeringChannel(steering).open();
  assert.throws(() => steeringChannel(steering).open(), /already attached/);
  await assert.rejects(steering.send("   "), /nonempty string/);
  const pending = steering.send("Pending");
  steering.close();
  assert.equal(steering.state, "closed");
  await assert.rejects(pending, /closed before the message was delivered/);
  await assert.rejects(steering.send("After close"), /Steering is closed/);
  release();
  assert.equal(steering.state, "closed");
  assert.throws(() => steeringChannel(steering).open(), /Steering is closed/);
  assert.throws(
    () =>
      steeringChannel({
        state: "idle",
        send: async () => ({ mode: "injected" as const }),
        close: () => undefined,
      }),
    /createSteering/,
  );
  assert.equal(steeringInbox(undefined), undefined);
});

test("steering targets filter taken messages and report the subagent of rejected ones", async () => {
  const steering = createSteering();
  const release = steeringChannel(steering).open();
  const inbox = steeringInbox(steering)!;
  const any = steering.send("Any loop");
  const main = steering.send("Main loop", { subagent: null });
  const child = steering.send("Child", { subagent: "run-1" });
  await assert.rejects(
    steering.send("Invalid", { subagent: "" }),
    /subagent run id or null/,
  );
  assert.equal(inbox.count(subagentSteering), 1);
  const taken = inbox.take(mainLoopSteering);
  assert.deepEqual(
    taken.map((message) => [message.text, message.subagent]),
    [
      ["Any loop", undefined],
      ["Main loop", null],
    ],
  );
  for (const message of taken) message.deliver({ mode: "injected" });
  inbox.reject(subagentSteering, "Not here");
  await assert.rejects(
    child,
    (error: unknown) =>
      error instanceof OutpostError &&
      error.code === "steering" &&
      error.details.subagent === "run-1",
  );
  release();
  assert.deepEqual(await any, { mode: "injected" });
  assert.deepEqual(await main, { mode: "injected" });
});
