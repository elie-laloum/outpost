import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  planRecoveryRetention,
  pruneRecoveryRetention,
  assertRecoveryQuota,
} from "../../src/application/recovery-retention.ts";
import type { RecoveryRetentionPolicy } from "../../src/application/recovery-retention.types.ts";
import { git } from "../../src/infrastructure/git/command.ts";
import { lock } from "../../src/infrastructure/git/lock.ts";
import { journal } from "../../src/infrastructure/journal.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { repository } from "../helpers.ts";

const policy: RecoveryRetentionPolicy = {
  version: 1,
  scopes: ["clean-workspaces", "closed-logs"],
  minAgeMs: 0,
};
async function workspace(root: string, name: string) {
  const path = join(root, ".outpost", "workspaces", name);
  await git(root, ["worktree", "add", "-b", name, path]);
  return path;
}

test("retention dry run accounts for all categories; apply removes only closed logs and clean worktrees while preserving branch commits", async (t) => {
  const root = await repository(t);
  const path = await workspace(root, "retained-branch");
  await writeFile(join(path, "committed.txt"), "unpublished\n");
  await git(path, ["add", "."]);
  await git(path, ["commit", "-m", "Retained commit"]);
  const head = (await git(path, ["rev-parse", "HEAD"])).trim();
  const log = await journal(root);
  log.record({ kind: "text", text: "diagnostic" });
  await log.close();
  await log.close();
  const recent = await planRecoveryRetention({
    repository: root,
    policy: { ...policy, minAgeMs: 86_400_000, maxWorkspaces: 0 },
  });
  assert.equal(
    recent.entries.some((entry) => entry.eligible),
    false,
  );
  assert.equal(recent.quota, "exceeded");
  assert.ok(recent.entries.some((entry) => entry.reason === "RETENTION_AGE"));
  const recovery = join(root, ".outpost", "recovery", "valuable.patch");
  await mkdir(join(root, ".outpost", "recovery"));
  await writeFile(recovery, "recovery data");
  const plan = await planRecoveryRetention({
    repository: root,
    policy: { ...policy, maxBytes: 0 },
  });
  assert.equal(plan.entries.filter((entry) => entry.eligible).length, 2);
  assert.equal(plan.quota, "exceeded");
  assert.equal(plan.projectedBytes, Buffer.byteLength("recovery data"));
  assert.ok(await readFile(log.file!));
  const result = await pruneRecoveryRetention(plan);
  assert.equal(result.removed.length, 2);
  assert.equal(result.retained.length, 0);
  assert.equal(result.after.usageBytes, plan.projectedBytes);
  assert.equal(result.after.quota, "exceeded");
  assert.equal(
    (await git(root, ["rev-parse", "retained-branch"])).trim(),
    head,
  );
  assert.equal(await readFile(recovery, "utf8"), "recovery data");
  await assert.rejects(readFile(log.file!), { code: "ENOENT" });
});

test("dirty, ignored, detached, unregistered, Git-locked and operation-owned workspaces are retained", async (t) => {
  const root = await repository(t);
  const dirty = await workspace(root, "dirty");
  await writeFile(join(dirty, "base.txt"), "dirty");
  const ignored = await workspace(root, "ignored");
  await writeFile(join(ignored, ".gitignore"), "secret\n");
  await git(ignored, ["add", ".gitignore"]);
  await git(ignored, ["commit", "-m", "ignore"]);
  await writeFile(join(ignored, "secret"), "valuable ignored file");
  const detached = await workspace(root, "detached");
  await git(detached, ["checkout", "--detach"]);
  const locked = await workspace(root, "locked");
  await git(root, ["worktree", "lock", locked]);
  const active = await workspace(root, "active");
  const release = await lock(root, "active");
  t.after(release);
  await mkdir(join(root, ".outpost", "workspaces", "unknown"));
  const plan = await planRecoveryRetention({ repository: root, policy });
  const reasons = Object.fromEntries(
    plan.entries
      .filter((entry) => entry.category === "workspaces")
      .map((entry) => [entry.path, entry.reason]),
  );
  assert.equal(reasons[dirty], "DIRTY_WORKSPACE");
  assert.equal(reasons[ignored], "IGNORED_FILES");
  assert.equal(reasons[detached], "DETACHED_WORKSPACE");
  assert.equal(reasons[locked], "GIT_LOCKED_WORKSPACE");
  assert.equal(reasons[active], "OPERATION_LOCK_PRESENT");
  assert.equal((await pruneRecoveryRetention(plan)).removed.length, 0);
});

test("pruning revalidates dirty changes, newly acquired locks, age and immutable log identity", async (t) => {
  const root = await repository(t);
  const dirty = await workspace(root, "changed");
  await workspace(root, "acquired");
  const log = await journal(root);
  await log.close();
  const plan = await planRecoveryRetention({ repository: root, policy });
  await writeFile(join(dirty, "new.txt"), "new work");
  const release = await lock(root, "acquired");
  t.after(release);
  const bytes = await readFile(log.file!);
  await rename(log.file!, `${log.file!}.old`);
  await writeFile(log.file!, bytes);
  const result = await pruneRecoveryRetention(plan);
  assert.equal(result.removed.length, 0);
  assert.equal(result.retained.length, 3);
  assert.equal(await readFile(join(dirty, "new.txt"), "utf8"), "new work");
  assert.equal(
    (
      await planRecoveryRetention({
        repository: root,
        policy: { ...policy, minAgeMs: 86400000 },
      })
    ).entries.some((entry) => entry.eligible),
    false,
  );
});

test("legacy/custom/unclosed/modified logs remain protected and reopening invalidates closure", async (t) => {
  const root = await repository(t);
  const active = await journal(root);
  t.after(() => active.close());
  const closed = await journal(root);
  await closed.close();
  const reopened = await journal(root, { file: closed.file! });
  t.after(() => reopened.close());
  const modified = await journal(root);
  await modified.close();
  await writeFile(modified.file!, "changed");
  const legacy = join(root, ".outpost", "logs", "legacy.jsonl");
  await writeFile(legacy, "old data");
  const plan = await planRecoveryRetention({ repository: root, policy });
  assert.equal(plan.entries.filter((entry) => entry.eligible).length, 0);
  await assert.rejects(readFile(`${closed.file!}.closed.json`), {
    code: "ENOENT",
  });
  assert.equal((await pruneRecoveryRetention(plan)).removed.length, 0);
  await active.close();
  await reopened.close();
});

test("quota admission fails closed on partial inventory and includes protected recovery and planned bytes", async (t) => {
  const root = await repository(t);
  await assertRecoveryQuota({ repository: root, maxBytes: 0 });
  await mkdir(join(root, ".outpost", "recovery"), { recursive: true });
  await writeFile(join(root, ".outpost", "recovery", "payload"), "12345");
  await assertRecoveryQuota({
    repository: root,
    maxBytes: 10,
    reserveBytes: 5,
  });
  await assert.rejects(
    assertRecoveryQuota({ repository: root, maxBytes: 9, reserveBytes: 5 }),
    /quota admission refused/,
  );
  await writeFile(join(root, ".outpost", "recovery", "other"), "x");
  await assert.rejects(
    assertRecoveryQuota({ repository: root, maxBytes: 100, maxEntries: 1 }),
    /quota admission refused/,
  );
  const plan = await planRecoveryRetention({
    repository: root,
    policy,
    maxEntries: 1,
  });
  assert.equal(plan.quota, "unknown");
  await assert.rejects(pruneRecoveryRetention(plan), /incomplete/);
  await assert.rejects(assertRecoveryQuota({ maxBytes: -1 }), /nonnegative/);
  await assert.rejects(
    assertRecoveryQuota({ maxBytes: 10, reserveBytes: -1 }),
    /nonnegative/,
  );
});

test("retention CLI defaults to dry run and requires a validated explicit policy", async (t) => {
  const root = await repository(t);
  const log = await journal(root);
  await log.close();
  const file = join(root, "retention.json");
  await writeFile(file, JSON.stringify(policy));
  const run = (args: string[]) =>
    executeProcess({
      executable: process.execPath,
      arguments: [
        resolve("src/cli/main.ts"),
        "recovery",
        "prune",
        "--repository",
        root,
        ...args,
      ],
    });
  const dry = await run(["--policy", file, "--json"]);
  assert.equal(dry.status, 0, dry.stderr);
  assert.equal(JSON.parse(dry.stdout).dryRun, true);
  assert.ok(await readFile(log.file!));
  const applied = await run(["--policy", file, "--apply"]);
  assert.equal(applied.status, 0, applied.stderr);
  assert.match(applied.stdout, /REMOVED/);
  assert.equal((await run([])).status, 1);
  assert.equal((await run(["--policy", file, "--git"])).status, 1);
  await writeFile(file, JSON.stringify({ ...policy, scopes: ["recovery"] }));
  assert.equal((await run(["--policy", file])).status, 1);
});

test("normal workspace disposal preserves ignored files instead of deleting recoverable input", async (t) => {
  const { acquireWorkspace } =
    await import("../../src/infrastructure/git/workspace.ts");
  const root = await repository(t);
  await writeFile(join(root, ".gitignore"), "secret\n.outpost/\n");
  await git(root, ["add", ".gitignore"]);
  await git(root, ["commit", "-m", "ignore"]);
  const lease = await acquireWorkspace({
    repository: root,
    branch: { mode: "named", name: "ignored-disposal" },
  });
  await writeFile(join(lease.directory, "secret"), "do not discard");
  assert.equal((await lease.dispose()).retainedDirectory, lease.directory);
  assert.equal(
    await readFile(join(lease.directory, "secret"), "utf8"),
    "do not discard",
  );
});
