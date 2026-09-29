import assert from "node:assert/strict";
import test from "node:test";
import { withVat } from "./vat.ts";

test("adds 20 % by default", () => {
  assert.equal(withVat(100), 120);
});

test("accepts a reduced rate", () => {
  assert.equal(withVat(100, 0.055), 105.5);
});
