import { lstat, realpath } from "node:fs/promises";
import { resolve, join } from "node:path";
import { OutpostError } from "../../domain/errors.ts";
import { requireSuccess } from "../process.ts";
import type { StorageEntry, StorageIssue } from "../storage-inventory.types.ts";
import {
  worktreeInspectionArguments,
  worktreeInspectionDefaults,
} from "./worktree-inspection.constants.ts";
import type {
  WorkspaceGitEntry,
  WorkspaceGitInspection,
  WorkspaceGitState,
} from "./worktree-inspection.types.ts";

async function inspectGit(
  path: string,
  args: readonly string[],
): Promise<string> {
  let length = 0;
  const result = await requireSuccess({
    executable: "git",
    arguments: [...worktreeInspectionArguments, ...args],
    directory: path,
    variables: { LC_ALL: "C", GIT_TERMINAL_PROMPT: "0" },
    deadlineMs: worktreeInspectionDefaults.deadlineMs,
    retain: worktreeInspectionDefaults.retainBytes,
    observe(channel, text) {
      if (channel !== "stdout") return;
      length += Buffer.byteLength(text);
      if (length > worktreeInspectionDefaults.retainBytes)
        throw new OutpostError(
          "workspace",
          "Git inspection output limit exceeded",
        );
    },
  });
  return result.stdout;
}

async function inspectEntry(
  entry: StorageEntry,
  records: readonly (readonly string[])[],
  commonDirectory: string,
): Promise<WorkspaceGitState> {
  if (entry.kind !== "directory")
    return { state: "skipped", reason: "NOT_DIRECTORY" };
  const fields = records.find((record) => {
    const path = record
      .find((field) => field.startsWith("worktree "))
      ?.slice(9);
    return path !== undefined && resolve(path) === resolve(entry.path);
  });
  if (!fields) return { state: "unregistered" };
  const head = fields.find((field) => field.startsWith("HEAD "))?.slice(5);
  if (!head) return { state: "unavailable", reason: "INVALID_REGISTRATION" };
  // A listed worktree may have been replaced since registration or inventory.
  if (
    !(await lstat(entry.path)).isDirectory() ||
    (await realpath(entry.path)) !== resolve(entry.path)
  )
    return { state: "unavailable", reason: "WORKSPACE_CHANGED" };
  const marker = await lstat(join(entry.path, ".git"));
  if (!marker.isFile())
    return { state: "unavailable", reason: "INVALID_GIT_MARKER" };
  const top = (
    await inspectGit(entry.path, ["rev-parse", "--show-toplevel"])
  ).trim();
  if (resolve(top) !== resolve(entry.path))
    return { state: "unavailable", reason: "WORKSPACE_CHANGED" };
  const common = (
    await inspectGit(entry.path, [
      "rev-parse",
      "--path-format=absolute",
      "--git-common-dir",
    ])
  ).trim();
  if ((await realpath(common)) !== commonDirectory)
    return { state: "unavailable", reason: "REGISTRATION_MISMATCH" };
  const status = await inspectGit(entry.path, [
    "status",
    "--porcelain=v1",
    "-z",
    "--untracked-files=normal",
    "--ignore-submodules=none",
  ]);
  return {
    state: "registered",
    head,
    branch:
      fields
        .find((field) => field.startsWith("branch refs/heads/"))
        ?.slice(18) ?? null,
    dirty: status.length > 0,
    locked: fields.some(
      (field) => field === "locked" || field.startsWith("locked "),
    ),
  };
}

export async function inspectWorktreeGit(
  repository: string,
  entries: readonly StorageEntry[],
): Promise<WorkspaceGitInspection> {
  const workspaces: WorkspaceGitEntry[] = [];
  const issues: StorageIssue[] = [];
  if (!entries.length) return { complete: true, workspaces, issues };
  let records: string[][];
  let commonDirectory: string;
  try {
    commonDirectory = await realpath(
      (
        await inspectGit(repository, [
          "rev-parse",
          "--path-format=absolute",
          "--git-common-dir",
        ])
      ).trim(),
    );
    const list = await inspectGit(repository, [
      "worktree",
      "list",
      "--porcelain",
      "-z",
    ]);
    records = list
      .split("\0\0")
      .filter(Boolean)
      .map((record) => record.split("\0"));
  } catch {
    return {
      complete: false,
      workspaces: entries.map(({ name, path }) => ({
        name,
        path,
        state: "unavailable",
        reason: "GIT_LIST_FAILED",
      })),
      issues: [{ path: repository, code: "GIT_LIST_FAILED" }],
    };
  }
  for (const entry of entries) {
    const state = await inspectEntry(entry, records, commonDirectory).catch(
      (): WorkspaceGitState => ({
        state: "unavailable",
        reason: "GIT_INSPECTION_FAILED",
      }),
    );
    workspaces.push({ name: entry.name, path: entry.path, ...state });
    if (state.state === "unavailable")
      issues.push({ path: entry.path, code: state.reason });
  }
  return { complete: issues.length === 0, workspaces, issues };
}
