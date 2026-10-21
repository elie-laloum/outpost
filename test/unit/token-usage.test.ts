import assert from "node:assert/strict";
import test from "node:test";
import { isTokenCount, validateTokenUsage } from "../../src/domain/usage.ts";

test("token counts are nonnegative safe integers", () => {
  for (const value of [0, 1, Number.MAX_SAFE_INTEGER])
    assert.equal(isTokenCount(value), true);
  for (const value of [-1, 1.5, Number.NaN, Infinity, 2 ** 53, "1", null])
    assert.equal(isTokenCount(value), false);
});

test("token usage keeps cache reads and writes inside input", () => {
  validateTokenUsage(
    { input: 10, cached: 4, cacheCreated: 6, output: 2 },
    "Harness usage",
  );
  assert.throws(
    () =>
      validateTokenUsage({ input: 1, cached: 0, output: -1 }, "Harness usage"),
    /Harness usage must contain nonnegative token counts/,
  );
  assert.throws(
    () =>
      validateTokenUsage(
        { input: 5, cached: 4, cacheCreated: 2, output: 0 },
        "Harness usage",
      ),
    /Cached tokens must be included in input usage/,
  );
});
