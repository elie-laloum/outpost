import { lstat, rm } from "node:fs/promises";
import { OutpostError, invariant } from "../domain/errors.ts";
import { git } from "../infrastructure/git/command.ts";
import { lock, lockPath } from "../infrastructure/git/lock.ts";
import { closedJournal } from "../infrastructure/journal-retention.ts";
import type { StorageEntry } from "../infrastructure/storage-inventory.types.ts";
import type { RecoveryInspection } from "./recovery-inspection.types.ts";
import { inspectRecovery } from "./recovery-inspection.ts";
import { retentionPolicy } from "./recovery-retention-policy.ts";
import type {
  RecoveryPruneResult,
  RecoveryRetainedEntry,
  RecoveryQuotaOptions,
  RecoveryRetentionEntry,
  RecoveryRetentionOptions,
  RecoveryRetentionPlan,
} from "./recovery-retention.types.ts";

async function workspaceReason(
  entry: StorageEntry,
  inspection: RecoveryInspection,
): Promise<string> {
  const workspace = inspection.git?.workspaces.find(
    (value) => value.path === entry.path,
  );
  if (!workspace || workspace.state !== "registered")
    return "WORKSPACE_UNREGISTERED_OR_UNKNOWN";
  if (workspace.branch === null) return "DETACHED_WORKSPACE";
  if (workspace.dirty) return "DIRTY_WORKSPACE";
  if (workspace.locked) return "GIT_LOCKED_WORKSPACE";
  try {
    await lstat(lockPath(inspection.repository, workspace.branch));
    return "OPERATION_LOCK_PRESENT";
  } catch (error) {
    if (!(
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ))
      return "OWNERSHIP_UNKNOWN";
  }
  try {
    const ignored = await git(entry.path, [
      "ls-files",
      "--others",
      "--ignored",
      "--exclude-standard",
      "-z",
    ]);
    if (ignored.length) return "IGNORED_FILES";
  } catch {
    return "WORKSPACE_STATE_UNKNOWN";
  }
  return "ELIGIBLE";
}

export async function planRecoveryRetention(
  options: RecoveryRetentionOptions,
): Promise<RecoveryRetentionPlan> {
  retentionPolicy(options.policy);
  const policy = structuredClone(options.policy);
  const inspection = await inspectRecovery({
    ...options,
    git: true,
    locks: true,
  });
  const entries: RecoveryRetentionEntry[] = [];
  const inspectedAt = new Date().toISOString();
  const complete = inspection.complete && inspection.git?.complete !== false;
  for (const category of inspection.categories) {
    for (const entry of category.entries) {
      let reason = "RECOVERY_DATA_PROTECTED";
      if (category.name === "locks") reason = "OWNERSHIP_RECORD_PROTECTED";
      if (category.name === "logs") reason = "LOG_ACTIVITY_OR_CONTENT_UNKNOWN";
      if (category.name === "workspaces") reason = "SCOPE_NOT_SELECTED";
      if (
        category.name === "workspaces" &&
        policy.scopes.includes("clean-workspaces")
      )
        reason = await workspaceReason(entry, inspection);
      if (
        category.name === "logs" &&
        policy.scopes.includes("closed-logs") &&
        entry.kind === "file" &&
        entry.name.endsWith(".jsonl") &&
        (await closedJournal(entry.path))
      )
        reason = "ELIGIBLE";
      if (category.name === "logs" && entry.name.endsWith(".closed.json"))
        reason = "CLOSURE_RECORD_PROTECTED";
      if (
        reason === "ELIGIBLE" &&
        (!entry.modifiedAt ||
          Date.parse(inspectedAt) - Date.parse(entry.modifiedAt) <
            policy.minAgeMs)
      )
        reason = "RETENTION_AGE";
      if (reason === "ELIGIBLE" && (!complete || !entry.complete))
        reason = "INCOMPLETE_INVENTORY";
      const workspace = inspection.git?.workspaces.find(
        (value) => value.path === entry.path,
      );
      entries.push({
        path: entry.path,
        category: category.name,
        bytes: entry.bytes,
        eligible: reason === "ELIGIBLE",
        reason,
        ...(entry.modifiedAt ? { modifiedAt: entry.modifiedAt } : {}),
        ...(workspace?.state === "registered" && workspace.branch
          ? { branch: workspace.branch, head: workspace.head }
          : {}),
      });
    }
  }
  const projectedBytes =
    inspection.usage.bytes -
    entries
      .filter((entry) => entry.eligible)
      .reduce(
        (sum, entry) =>
          sum +
          entry.bytes +
          (entry.category === "logs"
            ? (entries.find(
                (other) => other.path === `${entry.path}.closed.json`,
              )?.bytes ?? 0)
            : 0),
        0,
      );
  const workspaces = entries.filter(
    (entry) => entry.category === "workspaces" && !entry.eligible,
  ).length;
  const exceeded =
    (policy.maxBytes !== undefined && projectedBytes > policy.maxBytes) ||
    (policy.maxWorkspaces !== undefined && workspaces > policy.maxWorkspaces);
  return {
    repository: inspection.repository,
    policy,
    inspectedAt,
    inspection,
    entries,
    complete,
    usageBytes: inspection.usage.bytes,
    projectedBytes,
    quota: !complete ? "unknown" : exceeded ? "exceeded" : "within",
  };
}

export async function pruneRecoveryRetention(
  plan: RecoveryRetentionPlan,
): Promise<RecoveryPruneResult> {
  retentionPolicy(plan.policy);
  invariant(plan.complete, "Cannot prune an incomplete retention plan");
  const removed: string[] = [];
  const retained: RecoveryRetainedEntry[] = [];
  for (const candidate of plan.entries.filter((entry) => entry.eligible)) {
    const fresh = await planRecoveryRetention({
      repository: plan.repository,
      policy: plan.policy,
    });
    const entry = fresh.entries.find((value) => value.path === candidate.path);
    if (
      !entry?.eligible ||
      entry.head !== candidate.head ||
      entry.branch !== candidate.branch ||
      entry.bytes !== candidate.bytes ||
      entry.modifiedAt !== candidate.modifiedAt
    ) {
      retained.push({ path: candidate.path, reason: "PLAN_CHANGED" });
      continue;
    }
    try {
      if (entry.category === "workspaces" && entry.branch) {
        const release = await lock(plan.repository, entry.branch);
        try {
          const status = await git(entry.path, [
            "status",
            "--porcelain=v1",
            "--ignored",
            "--untracked-files=all",
          ]);
          invariant(!status.length, "Workspace changed before pruning");
          invariant(
            (await git(entry.path, ["rev-parse", "HEAD"])).trim() ===
              entry.head,
            "Workspace HEAD changed before pruning",
          );
          invariant(
            (
              await git(entry.path, ["symbolic-ref", "--short", "HEAD"])
            ).trim() === entry.branch,
            "Workspace branch changed before pruning",
          );
          await git(plan.repository, ["worktree", "remove", entry.path]);
        } finally {
          await release();
        }
      } else {
        const release = await lock(plan.repository, `journal:${entry.path}`);
        try {
          invariant(
            entry.category === "logs" && (await closedJournal(entry.path)),
            "Journal changed before pruning",
          );
          await rm(entry.path);
          await rm(`${entry.path}.closed.json`);
        } finally {
          await release();
        }
      }
      removed.push(entry.path);
    } catch {
      retained.push({
        path: candidate.path,
        reason: "REVALIDATION_OR_REMOVAL_FAILED",
      });
    }
  }
  return {
    removed,
    retained,
    after: await planRecoveryRetention({
      repository: plan.repository,
      policy: plan.policy,
    }),
  };
}

export async function assertRecoveryQuota(
  options: RecoveryQuotaOptions,
): Promise<void> {
  invariant(
    Number.isSafeInteger(options.maxBytes) && options.maxBytes >= 0,
    "maxBytes must be a nonnegative integer",
  );
  const reserve = options.reserveBytes ?? 0;
  invariant(
    Number.isSafeInteger(reserve) && reserve >= 0,
    "reserveBytes must be a nonnegative integer",
  );
  const inspection = await inspectRecovery(options);
  if (
    !inspection.complete ||
    inspection.usage.bytes + reserve > options.maxBytes
  )
    throw new OutpostError(
      "workspace",
      "Outpost storage quota admission refused",
      {
        usageBytes: inspection.usage.bytes,
        reserveBytes: reserve,
        maxBytes: options.maxBytes,
        complete: inspection.complete,
      },
    );
}
