import assert from "node:assert/strict";
import { test } from "node:test";
import {
  defineHarnessHook,
  defineHarnessPermissions,
} from "../../src/index.ts";
import { normalizeResourcePath } from "../../src/domain/permissions.ts";

test("hooks validate their phase, name and callback", () => {
  const hook = defineHarnessHook({ on: "stop", run: () => undefined });
  assert.equal(hook.name, "stop");
  assert.equal(hook.kind, "hook");
  assert.equal(
    defineHarnessHook({
      on: "before-tool",
      name: "guard",
      run: () => undefined,
    }).name,
    "guard",
  );
  for (const [options, message] of [
    [{ on: "after-stop", run: () => undefined }, /Hook phase/],
    [{ on: "stop", run: 1 }, /run must be a function/],
    [{ on: "stop", run: () => undefined, name: " " }, /name/],
    [{ on: "stop", run: () => undefined, when: 1 }, /Unsupported hook option/],
  ] as const)
    assert.throws(() => defineHarnessHook(options as never), message);
});

test("permission rules match tools, commands and normalized paths in order", () => {
  const permissions = defineHarnessPermissions({
    default: "deny",
    rules: [
      {
        effect: "deny",
        commands: ["rm -rf *"],
        reason: "No recursive removal",
      },
      { effect: "allow", tools: ["shell"], commands: ["npm *", "git status"] },
      { effect: "allow", tools: ["write_*"], paths: ["src/**", "docs/*.md"] },
      { effect: "deny", tools: ["read_file"], paths: ["**/.env"] },
      { effect: "allow", tools: ["read_*"] },
    ],
  });
  const check = (tool: string, resources: object) =>
    permissions.evaluate(tool, resources);
  assert.deepEqual(check("shell", { command: "rm -rf /" }), {
    allowed: false,
    reason: "No recursive removal",
  });
  assert.deepEqual(check("shell", { command: "npm test" }), { allowed: true });
  assert.deepEqual(check("shell", { command: "git status" }), {
    allowed: true,
  });
  assert.equal(check("shell", { command: "git push" }).allowed, false);
  assert.equal(check("shell", {}).allowed, false);
  assert.deepEqual(check("write_file", { paths: ["src/a/b.ts"] }), {
    allowed: true,
  });
  assert.deepEqual(
    check("write_file", { paths: ["./src/x.ts", "docs/a.md"] }),
    {
      allowed: true,
    },
  );
  assert.deepEqual(
    check("write_file", { paths: ["src/x.ts", "../etc/passwd"] }),
    {
      allowed: false,
      reason: "Denied by default permissions",
    },
  );
  assert.equal(
    check("write_file", { paths: ["docs/deep/a.md"] }).allowed,
    false,
  );
  assert.equal(
    check("write_file", { paths: ["/abs/src/x.ts"] }).allowed,
    false,
  );
  assert.equal(check("write_file", {}).allowed, false);
  assert.deepEqual(check("read_file", { paths: ["config/.env"] }), {
    allowed: false,
    reason: "Denied by permission rule 4",
  });
  assert.deepEqual(check("read_file", { paths: [".env"] }).allowed, false);
  assert.deepEqual(check("read_file", { paths: ["README.md"] }), {
    allowed: true,
  });
  assert.equal(check("other", {}).allowed, false);
  assert.deepEqual(defineHarnessPermissions({ rules: [] }).evaluate("x", {}), {
    allowed: true,
  });
  assert.equal(normalizeResourcePath("a/./b/../c"), "a/c");
  assert.equal(normalizeResourcePath("a\\b"), "a/b");
  assert.equal(normalizeResourcePath("C:/x"), undefined);
  assert.equal(normalizeResourcePath(".."), undefined);
  for (const [options, message] of [
    [{}, /rules array/],
    [{ rules: [], default: "maybe" }, /default/],
    [{ rules: [{ effect: "skip" }] }, /effect/],
    [{ rules: [{ effect: "deny", tools: [] }] }, /nonempty list/],
    [{ rules: [{ effect: "deny", paths: [""] }] }, /nonempty list/],
    [{ rules: [{ effect: "deny", reason: "" }] }, /reason/],
    [{ rules: [{ effect: "deny", when: 1 }] }, /accept effect/],
  ] as const)
    assert.throws(() => defineHarnessPermissions(options as never), message);
});
