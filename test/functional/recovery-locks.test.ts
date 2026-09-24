import assert from "node:assert/strict";
import { test } from "node:test";
import {
  chmod,
  lstat,
  mkdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { inspectRecovery } from "../../src/application/recovery-inspection.ts";
import { lock } from "../../src/infrastructure/git/lock.ts";
import { inspectLocks } from "../../src/infrastructure/git/lock-inspection.ts";
import { lockInspectionDefaults } from "../../src/infrastructure/git/lock-inspection.constants.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { repository } from "../helpers.ts";

const cli = resolve("src/cli/main.ts");

async function lockEntries(root: string) {
  const report = await inspectRecovery({ repository: root });
  return report.categories.find((category) => category.name === "locks")!
    .entries;
}

test("optional lock inspection observes a real owner without exposing its nonce or changing the lock", async (t) => {
  const root = await repository(t);
  const release = await lock(root, "retained");
  t.after(release);
  const before = await lockEntries(root);
  const path = before[0]!.path;
  const contents = await readFile(path);
  const stat = await lstat(path);
  assert.equal((await inspectRecovery({ repository: root })).locks, undefined);
  const report = await inspectRecovery({ repository: root, locks: true });
  assert.equal(report.activity, "unverified");
  assert.equal(report.locks?.scope, "local-pid");
  assert.equal(report.locks?.complete, true);
  assert.deepEqual(report.locks?.entries[0], {
    name: before[0]!.name,
    path,
    state: "present",
    pid: process.pid,
  });
  assert.doesNotMatch(JSON.stringify(report), /nonce/);
  assert.deepEqual(await readFile(path), contents);
  assert.equal((await lstat(path)).mtimeMs, stat.mtimeMs);
});

test("absent PID is only reported for ESRCH; permission and unexpected failures remain unknown", async (t) => {
  const root = await repository(t);
  const release = await lock(root, "probe");
  t.after(release);
  const entries = await lockEntries(root);
  for (const code of ["ESRCH", "EPERM", "EINVAL"]) {
    const report = await inspectLocks(entries, (pid) => {
      assert.equal(pid, process.pid);
      throw Object.assign(new Error("private diagnostic"), { code });
    });
    assert.equal(
      report.entries[0]?.state,
      code === "ESRCH" ? "absent" : "unknown",
    );
    assert.equal(report.complete, code === "ESRCH");
    assert.doesNotMatch(JSON.stringify(report), /private diagnostic/);
    assert.ok((await lstat(entries[0]!.path)).isFile());
  }
});

test("invalid PIDs and malformed or oversized records never reach the process probe", async (t) => {
  const root = await repository(t);
  const folder = join(root, ".outpost", "locks");
  await mkdir(folder, { recursive: true });
  const records = [
    "null",
    "[]",
    '"private-data"',
    "{}",
    "{",
    "",
    ...[0, -1, 1.5, "123", null, lockInspectionDefaults.maxPid + 1].map((pid) =>
      JSON.stringify({ pid }),
    ),
    JSON.stringify({
      pid: process.pid,
      extra: "x".repeat(lockInspectionDefaults.maxBytes),
    }),
  ];
  for (const [index, record] of records.entries())
    await writeFile(join(folder, `${index}.json`), record);
  const result = await inspectLocks(await lockEntries(root), () =>
    assert.fail("Invalid records must not probe processes"),
  );
  assert.equal(result.complete, false);
  assert.equal(result.entries.length, records.length);
  assert.ok(result.entries.every((entry) => entry.state === "unknown"));
  assert.equal(result.issues.length, records.length);
  assert.doesNotMatch(JSON.stringify(result), /private-data/);
});

test("non-file lock entries and symlink targets are skipped; replaced and vanished entries remain unknown", async (t) => {
  const root = await repository(t);
  const folder = join(root, ".outpost", "locks");
  await mkdir(join(folder, "directory"), { recursive: true });
  await symlink(root, join(folder, "symlink"), "junction");
  let result = await inspectLocks(await lockEntries(root), () =>
    assert.fail("Non-files must not probe processes"),
  );
  assert.equal(result.complete, true);
  assert.ok(result.entries.every((entry) => entry.state === "skipped"));
  const path = join(folder, "changed.json");
  await writeFile(path, JSON.stringify({ pid: process.pid }));
  const entries = await lockEntries(root);
  await rm(path);
  result = await inspectLocks(entries);
  assert.equal(result.complete, false);
  assert.equal(result.issues[0]?.code, "LOCK_READ_FAILED");
  await symlink(root, path, "junction");
  result = await inspectLocks(entries);
  assert.equal(result.complete, false);
  assert.equal(result.issues[0]?.code, "LOCK_READ_FAILED");
});

test(
  "unreadable lock files produce a partial report",
  { skip: process.platform === "win32" || process.getuid?.() === 0 },
  async (t) => {
    const root = await repository(t);
    const release = await lock(root, "private");
    t.after(release);
    const entries = await lockEntries(root);
    const path = entries[0]!.path;
    await chmod(path, 0);
    try {
      const result = await inspectLocks(entries);
      assert.equal(result.complete, false);
      assert.equal(result.issues[0]?.code, "LOCK_READ_FAILED");
    } finally {
      await chmod(path, 0o600);
    }
  },
);

test(
  "special lock entries cannot block inspection",
  { skip: process.platform === "win32", timeout: 5000 },
  async (t) => {
    const root = await repository(t);
    const release = await lock(root, "replaced");
    t.after(release);
    const entries = await lockEntries(root);
    const path = entries[0]!.path;
    await rm(path);
    const created = await executeProcess({
      executable: "mkfifo",
      arguments: [path],
    });
    assert.equal(created.status, 0);
    const result = await inspectLocks(entries);
    assert.equal(result.complete, false);
    assert.equal(result.entries[0]?.state, "unknown");
    const fresh = await inspectRecovery({ repository: root, locks: true });
    assert.equal(fresh.complete, false);
    assert.equal(fresh.locks?.entries[0]?.state, "skipped");
  },
);

test("lock CLI supports empty, combined Git and JSON reports and nonzero partial exit status", async (t) => {
  const root = await repository(t);
  const run = (args: string[] = []) =>
    executeProcess({
      executable: process.execPath,
      arguments: [
        cli,
        "recovery",
        "inspect",
        "--repository",
        root,
        "--locks",
        ...args,
      ],
    });
  const empty = await run(["--json", "--git"]);
  assert.equal(empty.status, 0, empty.stderr);
  assert.deepEqual(JSON.parse(empty.stdout).locks, {
    scope: "local-pid",
    complete: true,
    entries: [],
    issues: [],
  });
  assert.equal(JSON.parse(empty.stdout).git.complete, true);
  await assert.rejects(lstat(join(root, ".outpost")), { code: "ENOENT" });
  const release = await lock(root, "cli");
  t.after(release);
  const present = await run();
  assert.equal(present.status, 0, present.stderr);
  assert.match(present.stdout, /Lock PID inspection \(local host\): complete/);
  assert.match(present.stdout, new RegExp(`present \\| PID ${process.pid}`));
  assert.match(
    present.stdout,
    /No raw file contents were displayed or files removed/,
  );
  await writeFile(
    join(root, ".outpost", "locks", "invalid.json"),
    JSON.stringify({ pid: -1, nonce: "private-nonce" }),
  );
  const failed = await run(["--json"]);
  assert.equal(failed.status, 1);
  assert.equal(failed.stderr, "");
  assert.equal(JSON.parse(failed.stdout).complete, true);
  assert.equal(JSON.parse(failed.stdout).locks.complete, false);
  assert.doesNotMatch(failed.stdout, /private-nonce/);
  const text = await run();
  assert.match(text.stdout, /unknown \| INVALID_PID/);
  assert.match(text.stdout, /\[PARTIAL\] INVALID_PID/);
});
