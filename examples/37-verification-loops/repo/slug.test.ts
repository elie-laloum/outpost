import test from "node:test";
import assert from "node:assert/strict";
import { slug } from "./slug.ts";

test("lowercase", () => {
  assert.equal(slug("Hello World"), "hello-world");
});

test("extra whitespace", () => {
  assert.equal(slug("  Hello   World  "), "hello-world");
});

test("accents", () => {
  assert.equal(slug("Crème brûlée"), "creme-brulee");
});

test("punctuation", () => {
  assert.equal(slug("Hello, World! (2026)"), "hello-world-2026");
});
