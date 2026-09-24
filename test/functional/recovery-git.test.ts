import assert from "node:assert/strict";
import { test } from "node:test";
import {
  lstat,
  mkdir,
  readFile,
  rm,
  symlink,
  utimes,
  writeFile,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { inspectRecovery } from "../../src/application/recovery-inspection.ts";
import { git } from "../../src/infrastructure/git/command.ts";
import { inspectWorktreeGit } from "../../src/infrastructure/git/worktree-inspection.ts";
import { worktreeInspectionDefaults } from "../../src/infrastructure/git/worktree-inspection.constants.ts";
import { executeProcess, quote } from "../../src/infrastructure/process.ts";
import { repository } from "../helpers.ts";

const cli = resolve("src/cli/main.ts");

async function workspace(
  root: string,
  name: string,
  detached = false,
): Promise<string> {
  const path = join(root, ".outpost", "workspaces", name);
  await git(root, [
    "worktree",
    "add",
    ...(detached ? ["--detach"] : ["-b", name]),
    path,
    "HEAD",
  ]);
  return path;
}

test("optional Git inspection distinguishes clean, dirty, detached, locked and unregistered workspaces", async (t) => {
  const root = await repository(t);
  const clean = await workspace(root, "clean");
  await writeFile(join(root, ".git", "info", "exclude"), "ignored.txt\n");
  await writeFile(join(clean, "ignored.txt"), "private ignored content");
  const dirty = await workspace(root, "dirty");
  await writeFile(join(dirty, "base.txt"), "private changes");
  await git(root, ["worktree", "lock", dirty, "--reason", "private reason"]);
  await workspace(root, "detached", true);
  await mkdir(join(root, ".outpost", "workspaces", "orphan"));
  await writeFile(
    join(root, ".outpost", "workspaces", "file"),
    "private content",
  );
  await symlink(
    clean,
    join(root, ".outpost", "workspaces", "link"),
    "junction",
  );
  assert.equal((await inspectRecovery({ repository: root })).git, undefined);
  const report = await inspectRecovery({ repository: root, git: true });
  assert.equal(report.complete, true);
  assert.equal(report.git?.complete, true);
  const entries = report.git!.workspaces;
  const cleanState = entries.find((entry) => entry.name === "clean")!;
  assert.equal(cleanState.state, "registered");
  if (cleanState.state !== "registered")
    throw new Error("Expected registered workspace");
  assert.equal(cleanState.branch, "clean");
  assert.equal(cleanState.dirty, false);
  assert.equal(cleanState.locked, false);
  assert.equal(
    cleanState.head,
    (await git(root, ["rev-parse", "HEAD"])).trim(),
  );
  const dirtyState = entries.find((entry) => entry.name === "dirty")!;
  assert.equal(dirtyState.state, "registered");
  if (dirtyState.state !== "registered")
    throw new Error("Expected registered workspace");
  assert.equal(dirtyState.dirty, true);
  assert.equal(dirtyState.locked, true);
  const detached = entries.find((entry) => entry.name === "detached")!;
  assert.equal(detached.state, "registered");
  if (detached.state !== "registered")
    throw new Error("Expected registered workspace");
  assert.equal(detached.branch, null);
  assert.equal(detached.dirty, false);
  assert.equal(
    entries.find((entry) => entry.name === "orphan")?.state,
    "unregistered",
  );
  assert.equal(
    entries.find((entry) => entry.name === "link")?.state,
    "skipped",
  );
  assert.equal(
    entries.find((entry) => entry.name === "file")?.state,
    "skipped",
  );
  assert.doesNotMatch(
    JSON.stringify(report),
    /private (ignored content|changes|reason|content)/,
  );
});

test("Git inspection detects staged and untracked changes without refreshing the index or running fsmonitor", async (t) => {
  const root = await repository(t);
  const path = await workspace(root, "read-only");
  const metadata = (
    await git(path, ["rev-parse", "--absolute-git-dir"])
  ).trim();
  const base = join(path, "base.txt");
  await utimes(base, new Date("2020-01-01"), new Date("2020-01-01"));
  const config = join(root, ".git", "config");
  const monitor = join(root, "monitor.cjs");
  const marker = join(root, "monitor-ran");
  await writeFile(
    monitor,
    `require("node:fs").writeFileSync(${JSON.stringify(marker)}, "ran");`,
  );
  await git(root, [
    "config",
    "core.fsmonitor",
    `${quote(process.execPath.replaceAll("\\", "/"))} ${quote(monitor.replaceAll("\\", "/"))}`,
  ]);
  await git(path, ["status", "--porcelain"]);
  assert.equal(await readFile(marker, "utf8"), "ran");
  await rm(marker);
  await utimes(base, new Date("2022-01-01"), new Date("2022-01-01"));
  const inspectedIndex = await readFile(join(metadata, "index"));
  const inspectedStat = await lstat(join(metadata, "index"));
  const beforeConfig = await readFile(config);
  const report = await inspectRecovery({ repository: root, git: true });
  assert.equal(report.git?.complete, true);
  assert.deepEqual(await readFile(join(metadata, "index")), inspectedIndex);
  assert.equal(
    (await lstat(join(metadata, "index"))).mtimeMs,
    inspectedStat.mtimeMs,
  );
  assert.deepEqual(await readFile(config), beforeConfig);
  await assert.rejects(lstat(marker), { code: "ENOENT" });
  await assert.rejects(lstat(join(metadata, "index.lock")), { code: "ENOENT" });
  await git(root, ["config", "--unset", "core.fsmonitor"]);
  for (const kind of ["untracked", "staged"]) {
    await writeFile(join(path, "new.txt"), "private-new");
    if (kind === "staged") await git(path, ["add", "new.txt"]);
    const state = (await inspectRecovery({ repository: root, git: true })).git!
      .workspaces[0]!;
    assert.equal(state.state, "registered");
    if (state.state !== "registered")
      throw new Error("Expected registered workspace");
    assert.equal(state.dirty, true, kind);
  }
});

test("Git inspection reports unreadable registrations without changing or pruning them", async (t) => {
  const root = await repository(t);
  const broken = await workspace(root, "broken");
  const metadata = (
    await git(broken, ["rev-parse", "--absolute-git-dir"])
  ).trim();
  await rm(join(broken, ".git"));
  const report = await inspectRecovery({ repository: root, git: true });
  assert.equal(report.complete, true);
  assert.equal(report.git?.complete, false);
  assert.equal(report.git?.workspaces[0]?.state, "unavailable");
  assert.equal(report.git?.issues[0]?.code, "GIT_INSPECTION_FAILED");
  assert.ok((await lstat(metadata)).isDirectory());
  const result = await executeProcess({
    executable: process.execPath,
    arguments: [
      cli,
      "recovery",
      "inspect",
      "--repository",
      root,
      "--git",
      "--json",
    ],
  });
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stdout).git.complete, false);
  assert.equal(result.stderr, "");
  await mkdir(join(broken, ".git"));
  const invalid = await inspectRecovery({ repository: root, git: true });
  assert.equal(invalid.git?.issues[0]?.code, "INVALID_GIT_MARKER");
});

test("Git inspection refuses a registered path redirected to an unrelated repository", async (t) => {
  const root = await repository(t);
  const other = await repository(t);
  const path = await workspace(root, "replaced");
  await rm(join(path, ".git"));
  await writeFile(join(path, ".git"), `gitdir: ${join(other, ".git")}\n`);
  const report = await inspectRecovery({ repository: root, git: true });
  assert.equal(report.git?.complete, false);
  assert.equal(report.git?.issues[0]?.code, "REGISTRATION_MISMATCH");
});

test("Git registry failures remain explicit and empty or limited inventories do not create runtime state", async (t) => {
  const root = await repository(t);
  const empty = await inspectRecovery({ repository: root, git: true });
  assert.deepEqual(empty.git, { complete: true, workspaces: [], issues: [] });
  await assert.rejects(lstat(join(root, ".outpost")), { code: "ENOENT" });
  await workspace(root, "retained");
  const inventory = await inspectRecovery({ repository: root });
  const entries = inventory.categories.find(
    (category) => category.name === "workspaces",
  )!.entries;
  await rm(join(root, ".git"), { recursive: true });
  const failed = await inspectWorktreeGit(root, entries);
  assert.equal(failed.complete, false);
  assert.equal(failed.workspaces[0]?.state, "unavailable");
  assert.equal(failed.issues[0]?.code, "GIT_LIST_FAILED");
});

test("Git CLI output includes branches, detached HEAD and dirty state without file contents", async (t) => {
  const root = await repository(t);
  const path = await workspace(root, "topic");
  await writeFile(join(path, "base.txt"), "private-changes");
  await workspace(root, "detached", true);
  const result = await executeProcess({
    executable: process.execPath,
    arguments: [cli, "recovery", "inspect", "--repository", root, "--git"],
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Workspace Git inspection: complete/);
  assert.match(result.stdout, /"topic" \| dirty/);
  assert.match(result.stdout, /detached HEAD \| clean/);
  assert.match(
    result.stdout,
    /No raw file contents were displayed or files removed/,
  );
  assert.doesNotMatch(result.stdout, /private-changes/);
});

test("Git inspection includes dirty submodules even when their local configuration hides changes", async (t) => {
  const root = await repository(t);
  const child = await repository(t);
  const path = await workspace(root, "submodules");
  await git(path, [
    "-c",
    "protocol.file.allow=always",
    "submodule",
    "add",
    child,
    "child",
  ]);
  await git(path, ["commit", "-am", "Add child"]);
  await git(path, ["config", "submodule.child.ignore", "all"]);
  await writeFile(join(path, "child", "base.txt"), "private-submodule-change");
  const report = await inspectRecovery({ repository: root, git: true });
  const state = report.git!.workspaces[0]!;
  assert.equal(state.state, "registered");
  if (state.state !== "registered")
    throw new Error("Expected registered workspace");
  assert.equal(state.dirty, true);
  assert.doesNotMatch(JSON.stringify(report), /private-submodule-change/);
});

test("oversized Git registry output is reported as unavailable instead of silently truncating registrations", async (t) => {
  const root = await repository(t);
  const path = await workspace(root, "large");
  const metadata = (
    await git(path, ["rev-parse", "--absolute-git-dir"])
  ).trim();
  await writeFile(
    join(metadata, "locked"),
    "x".repeat(worktreeInspectionDefaults.retainBytes + 1),
  );
  const report = await inspectRecovery({ repository: root, git: true });
  assert.equal(report.git?.complete, false);
  assert.equal(report.git?.issues[0]?.code, "GIT_LIST_FAILED");
  assert.equal(report.git?.workspaces[0]?.state, "unavailable");
});
