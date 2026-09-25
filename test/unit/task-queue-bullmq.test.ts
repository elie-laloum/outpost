import assert from "node:assert/strict";
import { test } from "node:test";
import { bullmqTaskQueue } from "../../src/infrastructure/task-queue-bullmq.ts";
import { bullMQState } from "../../src/infrastructure/task-queue-bullmq-state.ts";

test("BullMQ validates configuration before creating connections", async () => {
  const connection = { host: "127.0.0.1" };
  await assert.rejects(bullmqTaskQueue({ name: "", connection }), /identifier/);
  await assert.rejects(
    bullmqTaskQueue({ name: "test", connection, prefix: "" }),
    /identifier/,
  );
  await assert.rejects(
    bullmqTaskQueue({ name: "test", connection, stalledIntervalMs: 0 }),
    /interval/,
  );
  await assert.rejects(
    bullmqTaskQueue({
      name: "test",
      connection: { ...connection, keyPrefix: "wrong" },
    }),
    /keyPrefix/,
  );
});

test("BullMQ rejects malformed external state and preserves terminal result values", () => {
  assert.equal(bullMQState(null), undefined);
  for (const value of [
    undefined,
    {},
    [],
    [1, "{}", ""],
    ["{}", false, ""],
    ["{}", "{}", 0],
    ["null", "{}", ""],
    ["{}", "broken", ""],
    ["{}", "{}", ""],
  ])
    assert.throws(() => bullMQState(value));
  const state = bullMQState([
    JSON.stringify({
      id: "id",
      handler: "work",
      input: [1.2345678901234567, {}, []],
    }),
    JSON.stringify({
      status: "done",
      fence: 2,
      worker: "worker",
      token: "token",
      expires: 42,
    }),
    JSON.stringify({ value: [Number.MAX_SAFE_INTEGER, null, []] }),
  ]);
  assert.equal(state?.token, "token");
  assert.equal(state?.job.fence, 2);
  assert.deepEqual(state?.job.result?.value, [
    Number.MAX_SAFE_INTEGER,
    null,
    [],
  ]);
});
