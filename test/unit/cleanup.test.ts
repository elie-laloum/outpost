import assert from "node:assert/strict";
import test from "node:test";
import { runCleanup, withCleanup } from "../../src/domain/cleanup.ts";
import { recoveryDetails } from "../../src/domain/errors.ts";

test("cleanup attempts ordered steps and retains the original error", async () => {
  const primary = new Error("execution"),
    first = new Error("close"),
    last = new Error("remove");
  const order: number[] = [];
  await assert.rejects(
    runCleanup(
      [
        async () => {
          order.push(1);
          throw first;
        },
        () => {
          order.push(2);
        },
        () => {
          order.push(3);
          throw last;
        },
      ],
      [primary],
    ),
    (error) => {
      assert.ok(error instanceof AggregateError);
      assert.deepEqual(error.errors, [primary, first, last]);
      assert.equal(error.cause, primary);
      return true;
    },
  );
  assert.deepEqual(order, [1, 2, 3]);
  await runCleanup([() => {}], [primary]);
  await assert.rejects(
    runCleanup([
      () => {
        throw first;
      },
    ]),
    (error) => error === first,
  );
});

test("withCleanup runs every step after the action and reports only cleanup failures on success", async () => {
  const order: string[] = [];
  assert.equal(
    await withCleanup(async () => {
      order.push("action");
      return "value";
    }, [() => order.push("first"), () => order.push("second")]),
    "value",
  );
  assert.deepEqual(order, ["action", "first", "second"]);
  const close = new Error("close");
  await assert.rejects(
    withCleanup(
      async () => "value",
      [
        () => {
          throw close;
        },
      ],
    ),
    (error) => error === close,
  );
});

test("withCleanup aggregates a cleanup failure with the execution failure it would otherwise mask", async () => {
  const primary = new Error("release"),
    close = new Error("workspace close");
  const order: string[] = [];
  await assert.rejects(
    withCleanup(
      async () => {
        throw primary;
      },
      [
        () => {
          order.push("close");
          throw close;
        },
        () => order.push("remove"),
      ],
      { message: "Close failed" },
    ),
    (error) => {
      assert.ok(error instanceof AggregateError);
      assert.equal(error.message, "Close failed");
      assert.deepEqual(error.errors, [primary, close]);
      assert.equal(error.cause, primary);
      return true;
    },
  );
  assert.deepEqual(order, ["close", "remove"]);
});

test("recovery cleanup rethrows the execution failure and records cleanup failures on it", async () => {
  const primary = new Error("agent"),
    hooks = new Error("hooks"),
    pull = new Error("pull");
  await assert.rejects(
    withCleanup(
      async () => {
        throw primary;
      },
      [
        () => {
          throw hooks;
        },
      ],
      { recovery: "hookCleanupError" },
    ),
    (error) => error === primary,
  );
  assert.equal(recoveryDetails(primary)?.hookCleanupError, hooks);
  const second = new Error("second agent");
  await runCleanup(
    [
      () => {
        throw hooks;
      },
      () => {
        throw pull;
      },
    ],
    [second],
    { recovery: "hookCleanupError" },
  );
  const recorded = recoveryDetails(second)?.hookCleanupError;
  assert.ok(recorded instanceof AggregateError);
  assert.deepEqual(recorded.errors, [hooks, pull]);
  await assert.rejects(
    withCleanup(
      async () => "value",
      [
        () => {
          throw hooks;
        },
      ],
      { recovery: "hookCleanupError" },
    ),
    (error) => error === hooks,
  );
});
