import assert from "node:assert/strict";
import { test } from "node:test";
import { glob } from "../../src/domain/glob.ts";

test("text question marks match one character including slashes and newlines", () => {
  for (const character of ["/", "a", "\n"])
    assert.equal(glob("git ?", "text").test(`git ${character}`), true);
  assert.equal(glob("git ?", "text").test("git "), false);
  assert.equal(glob("git ?", "text").test("git ab"), false);
  assert.equal(glob("src/?", "path").test("src/a"), true);
  assert.equal(glob("src/?", "path").test("src//"), false);
});
