import { test } from "node:test";
import assert from "node:assert/strict";
import { createSteering, OutpostError } from "../../src/index.ts";
import { steeringChannel, steeringInbox } from "../../src/domain/steering.ts";

test("steering queues messages until a dispatch delivers them", async () => {
  const steering = createSteering();
  assert.equal(steering.state, "idle");
  const sent = steering.send("Keep the public API stable.");
  const release = steeringChannel(steering).open();
  assert.equal(steering.state, "active");
  const inbox = steeringInbox(steering)!;
  assert.equal(inbox.size, 1);
  const [message] = inbox.take();
  assert.equal(message?.text, "Keep the public API stable.");
  assert.equal(inbox.size, 0);
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
  assert.equal(steeringInbox(steering)!.size, 1);
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
