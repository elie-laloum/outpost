import test from "node:test";
import assert from "node:assert/strict";
import { slug } from "./slug.ts";

test("simple words", () => {
  assert.equal(slug("Hello World"), "hello-world");
});

test("extra whitespace", () => {
  assert.equal(slug("  Hello   World  "), "hello-world");
});
