import assert from "node:assert/strict";
import test from "node:test";
import { runCleanup } from "../../src/domain/cleanup.ts";

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
