import assert from "node:assert/strict";
import test from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { createDeadline } from "../../src/domain/deadline.ts";

test("deadlines distinguish expiry from parent cancellation and stop on close", async () => {
  const reason = new Error("deadline");
  const deadline = createDeadline({ durationMs: 5, reason });
  await delay(20);
  assert.equal(deadline.signal.reason, reason);
  assert.ok(deadline.expired.aborted);
  deadline.close();
  const parent = new AbortController();
  const cancelled = createDeadline({ parent: parent.signal, durationMs: 5 });
  parent.abort("parent");
  await delay(20);
  assert.equal(cancelled.signal.reason, "parent");
  assert.equal(cancelled.expired.aborted, false);
  cancelled.close();
  const closed = createDeadline({ durationMs: 5 });
  closed.close();
  await delay(20);
  assert.equal(closed.signal.aborted, false);
});

test("closing a deadline with a reason stops bound work without expiring it", async () => {
  const parent = new AbortController();
  const ended = new Error("call ended");
  const deadline = createDeadline({ parent: parent.signal, durationMs: 5 });
  deadline.close(ended);
  assert.equal(deadline.signal.reason, ended);
  assert.equal(deadline.expired.aborted, false);
  await delay(20);
  assert.equal(deadline.expired.aborted, false);
  assert.equal(parent.signal.aborted, false);
});
