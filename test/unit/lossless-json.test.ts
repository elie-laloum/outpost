import assert from "node:assert/strict";
import test from "node:test";
import { losslessJson } from "../../src/domain/lossless-json.ts";

test("lossless JSON validates without invoking getters and labels its owning contract", () => {
  let invoked = false;
  const cycle: Record<string, unknown> = {};
  cycle.self = cycle;
  const getter = {
    get secret() {
      invoked = true;
      return "secret";
    },
  };
  for (const value of [
    cycle,
    getter,
    new Date(),
    [1, , 3],
    -0,
    NaN,
    Infinity,
    undefined,
    { [Symbol("hidden")]: 1 },
  ]) {
    assert.throws(
      () => losslessJson(value, { label: "Decision state" }),
      /Decision state/,
    );
  }
  assert.equal(invoked, false);
  const original = { values: [1, false, null] };
  const copied = losslessJson(original);
  original.values.push(2);
  assert.equal(JSON.stringify(copied), '{"values":[1,false,null]}');
});
