import assert from "node:assert/strict";
import { test } from "node:test";
import { slug } from "./slug.ts";

for (const [input, expected] of [
  ["Hello World", "hello-world"],
  ["  Hello   World  ", "hello-world"],
  ["HELLO", "hello"],
  ["Already-Slugged", "already-slugged"],
  ["", ""],
  ["   ", ""],
] as const)
  test(`slug(${JSON.stringify(input)})`, () => {
    assert.equal(slug(input), expected);
  });
