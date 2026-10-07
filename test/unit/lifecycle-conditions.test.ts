import assert from "node:assert/strict";
import { test } from "node:test";
import { changed } from "../../src/index.ts";
import { createLifecycleHookRunner } from "../../src/application/lifecycle-hooks.ts";

test("changed copies and freezes relative file declarations", () => {
  const files = ["package-lock.json", "app/pnpm-lock.yaml"];
  const condition = changed(files);
  files.push("other");
  assert.deepEqual(condition, {
    kind: "changed",
    files: ["package-lock.json", "app/pnpm-lock.yaml"],
  });
  assert.ok(Object.isFrozen(condition));
  assert.ok(Object.isFrozen(condition.files));
});

test("changed refuses empty, duplicate, absolute and traversal paths", () => {
  for (const files of [
    [],
    [""],
    [" "],
    ["../lock"],
    ["a/../lock"],
    ["/lock"],
    ["C:/lock"],
    ["a\\lock"],
    ["a\0b"],
    ["a//b"],
    ["a/./b"],
    ["lock", "lock"],
  ])
    assert.throws(() => changed(files), /Changed files|changed requires/);
});

test("fingerprint failures prevent hook execution and cannot mark it prepared", async () => {
  let calls = 0;
  const invoke = async () => {
    calls++;
    return { status: 0, stdout: "truncated", stderr: "" };
  };
  const run = createLifecycleHookRunner(
    [{ executable: "npm", when: changed(["lock"]) }],
    "/repo",
    invoke,
  );
  await assert.rejects(run(), /Invalid lifecycle file fingerprint/);
  await assert.rejects(
    run(undefined, true),
    /Invalid lifecycle file fingerprint/,
  );
  assert.equal(calls, 2);
});
