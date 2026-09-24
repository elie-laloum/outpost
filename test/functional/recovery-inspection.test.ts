import assert from "node:assert/strict";
import { test } from "node:test";
import {
  chmod,
  lstat,
  mkdir,
  readFile,
  symlink,
  utimes,
  writeFile,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { inspectRecovery } from "../../src/application/recovery-inspection.ts";
import { storageInventory } from "../../src/infrastructure/storage-inventory.ts";
import { storageInventoryDefaults } from "../../src/infrastructure/storage-inventory.constants.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { repository } from "../helpers.ts";

const cli = resolve("src/cli/main.ts");

test("inspection resolves a checkout from a subdirectory without creating runtime state or changing Git metadata", async (t) => {
  const root = await repository(t);
  const nested = join(root, "nested");
  await mkdir(nested);
  const exclude = await readFile(join(root, ".git", "info", "exclude"));
  const index = await readFile(join(root, ".git", "index"));
  const report = await inspectRecovery({ repository: nested });
  assert.equal(report.repository, root);
  assert.equal(report.activity, "unverified");
  assert.equal(report.complete, true);
  assert.equal(report.scannedEntries, 0);
  assert.deepEqual(
    report.categories.map((category) => category.name),
    ["recovery", "logs", "locks", "workspaces"],
  );
  assert.ok(
    report.categories.every((category) => category.entries.length === 0),
  );
  assert.equal(report.usage.bytes, 0);
  await assert.rejects(lstat(join(root, ".outpost")), { code: "ENOENT" });
  assert.deepEqual(
    await readFile(join(root, ".git", "info", "exclude")),
    exclude,
  );
  assert.deepEqual(await readFile(join(root, ".git", "index")), index);
});

test("inspection measures nested logical bytes and recent modification times without exposing or changing content", async (t) => {
  const root = await repository(t);
  const storage = join(root, ".outpost");
  const backup = join(storage, "recovery", "backup", "incoming");
  await mkdir(backup, { recursive: true });
  await writeFile(join(backup, "data.bin"), Buffer.alloc(7));
  await writeFile(
    join(storage, "recovery", "backup", "state.json"),
    "private-state",
  );
  for (const group of ["logs", "locks", "workspaces"])
    await mkdir(join(storage, group), { recursive: true });
  await writeFile(join(storage, "logs", "run.jsonl"), "private-prompt-é");
  await writeFile(join(storage, "locks", "owner.json"), "private-lock");
  await writeFile(join(storage, "workspaces", "orphan"), "private-work");
  const recent = new Date("2040-01-01T00:00:00.000Z");
  await utimes(join(backup, "data.bin"), recent, recent);
  const report = await inspectRecovery({ repository: root });
  const recovery = report.categories[0]!.entries[0]!;
  assert.equal(recovery.kind, "directory");
  assert.equal(recovery.bytes, 20);
  assert.equal(recovery.files, 2);
  assert.equal(recovery.directories, 2);
  assert.equal(recovery.modifiedAt, recent.toISOString());
  assert.equal(
    report.usage.bytes,
    20 + Buffer.byteLength("private-prompt-é") + 12 + 12,
  );
  assert.equal(report.usage.files, 5);
  assert.equal(report.scannedEntries, 7);
  assert.equal(report.complete, true);
  assert.doesNotMatch(
    JSON.stringify(report),
    /private-(state|prompt|lock|work)/,
  );
  assert.equal(
    await readFile(join(storage, "logs", "run.jsonl"), "utf8"),
    "private-prompt-é",
  );
});

test("symlinks inside entries are counted without following outside targets or loops", async (t) => {
  const root = await repository(t);
  const outside = join(root, "outside");
  await mkdir(outside);
  await writeFile(join(outside, "private-target"), Buffer.alloc(1000));
  const backup = join(root, ".outpost", "recovery", "backup");
  await mkdir(backup, { recursive: true });
  await writeFile(join(backup, "small"), "abc");
  await symlink(outside, join(backup, "external"), "junction");
  await symlink(backup, join(backup, "loop"), "junction");
  const report = await inspectRecovery({ repository: root });
  assert.equal(report.complete, true);
  assert.equal(report.usage.bytes, 3);
  assert.equal(report.usage.symlinks, 2);
  assert.doesNotMatch(JSON.stringify(report), /private-target/);
});

test("runtime and category symlinks are refused without traversing their targets", async (t) => {
  for (const level of ["runtime", "category"]) {
    const root = await repository(t);
    const outside = join(root, "outside");
    await mkdir(outside);
    await writeFile(join(outside, "secret"), "private-target");
    const runtime = join(root, ".outpost");
    if (level === "category") await mkdir(runtime);
    await symlink(
      outside,
      level === "runtime" ? runtime : join(runtime, "logs"),
      "junction",
    );
    const report = await inspectRecovery({ repository: root });
    assert.equal(report.complete, false);
    assert.equal(report.usage.bytes, 0);
    assert.equal(report.issues[0]?.code, "SYMLINK_ROOT");
    assert.ok(
      report.categories.every((category) => category.entries.length === 0),
    );
    assert.equal(
      await readFile(join(outside, "secret"), "utf8"),
      "private-target",
    );
  }
});

test("entry and depth limits produce explicit partial inventories", async (t) => {
  const root = await repository(t);
  const runtime = join(root, ".outpost");
  const recovery = join(runtime, "recovery", "backup");
  await mkdir(recovery, { recursive: true });
  await writeFile(join(recovery, "file"), "abc");
  const partial = await inspectRecovery({ repository: root, maxEntries: 1 });
  assert.equal(partial.complete, false);
  assert.equal(partial.scannedEntries, 1);
  assert.equal(partial.issues[0]?.code, "ENTRY_LIMIT");
  assert.equal(partial.categories[0]?.entries[0]?.complete, false);
  const exact = await inspectRecovery({ repository: root, maxEntries: 2 });
  assert.equal(exact.complete, true);
  assert.equal(exact.usage.bytes, 3);
  let path = recovery;
  for (let i = 0; i <= storageInventoryDefaults.maxDepth; i++)
    path = join(path, "a");
  await mkdir(path, { recursive: true });
  const deep = await inspectRecovery({ repository: root });
  assert.equal(deep.complete, false);
  assert.ok(deep.issues.some((issue) => issue.code === "DEPTH_LIMIT"));
  for (const maxEntries of [0, -1, 1.5, NaN])
    await assert.rejects(
      storageInventory(runtime, maxEntries),
      /positive integer/,
    );
});

test("unexpected category files are reported while readable categories are still measured", async (t) => {
  const root = await repository(t);
  const runtime = join(root, ".outpost");
  await mkdir(join(runtime, "logs"), { recursive: true });
  await writeFile(join(runtime, "recovery"), "not a directory");
  await writeFile(join(runtime, "logs", "run.jsonl"), "abc");
  const report = await inspectRecovery({ repository: root });
  assert.equal(report.complete, false);
  assert.equal(report.issues[0]?.code, "NOT_DIRECTORY");
  assert.equal(report.usage.bytes, 3);
});

test(
  "unreadable directories give a partial report instead of silently reporting zero",
  { skip: process.platform === "win32" || process.getuid?.() === 0 },
  async (t) => {
    const root = await repository(t);
    const path = join(root, ".outpost", "recovery", "private");
    await mkdir(path, { recursive: true });
    await chmod(path, 0);
    try {
      const report = await inspectRecovery({ repository: root });
      assert.equal(report.complete, false);
      assert.equal(report.categories[0]?.entries[0]?.complete, false);
      assert.equal(report.issues[0]?.code, "EACCES");
    } finally {
      await chmod(path, 0o700);
    }
  },
);

test(
  "special files are counted without trying to read or block on them",
  { skip: process.platform === "win32", timeout: 5000 },
  async (t) => {
    const root = await repository(t);
    const path = join(root, ".outpost", "recovery");
    await mkdir(path, { recursive: true });
    const created = await executeProcess({
      executable: "mkfifo",
      arguments: [join(path, "pipe")],
    });
    assert.equal(created.status, 0);
    const report = await inspectRecovery({ repository: root });
    assert.equal(report.complete, false);
    assert.equal(report.usage.other, 1);
    assert.equal(report.issues[0]?.code, "UNSUPPORTED_TYPE");
  },
);

test("recovery CLI emits metadata-only JSON, honest partial exit status and actionable argument errors", async (t) => {
  const root = await repository(t);
  const path = join(root, ".outpost", "recovery", "backup");
  await mkdir(path, { recursive: true });
  await writeFile(join(path, "data"), "private-content");
  const run = (args: string[]) =>
    executeProcess({
      executable: process.execPath,
      arguments: [cli, ...args],
      directory: root,
    });
  const json = await run(["recovery", "inspect", "--json"]);
  assert.equal(json.status, 0, json.stderr);
  assert.equal(JSON.parse(json.stdout).repository, root);
  assert.doesNotMatch(json.stdout, /private-content/);
  const partial = await run([
    "recovery",
    "inspect",
    "--repository",
    ".",
    "--max-entries",
    "1",
    "--json",
  ]);
  assert.equal(partial.status, 1);
  assert.equal(partial.stderr, "");
  assert.equal(JSON.parse(partial.stdout).complete, false);
  const text = await run(["recovery", "inspect"]);
  assert.equal(text.status, 0);
  assert.match(text.stdout, /recovery: 1 listed entries/);
  assert.match(text.stdout, /15 bytes/);
  assert.match(text.stdout, /Activity and recovery integrity are unverified/);
  const limited = await run(["recovery", "inspect", "--max-entries", "1"]);
  assert.match(limited.stdout, /ENTRY_LIMIT/);
  assert.match(limited.stdout, /totals are partial/);
  for (const args of [
    ["recovery"],
    ["recovery", "prune"],
    ["recovery", "inspect", "extra"],
    ["recovery", "inspect", "--agent", "codex"],
    ["recovery", "inspect", "--max-entries", "0"],
  ]) {
    const result = await run(args);
    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      /Unknown command|Usage|Unsupported|positive integer|unknown option|too many arguments/,
    );
  }
});
