import { observedOperation } from "../domain/observed-operation.ts";
import type { ObservationHub } from "../domain/observation.types.ts";
import type { TransportStoreOptions } from "../domain/transport.types.ts";
import {
  planTransportRetention,
  pruneTransportRetention,
} from "./transport-retention.ts";
import { lstat } from "node:fs/promises";
import { join } from "node:path";
import { repositoryTransport } from "../infrastructure/repository-transport.ts";
import { repositoryStorageDirectory } from "../infrastructure/repository-transport.constants.ts";
import { OutpostError, invariant } from "../domain/errors.ts";
import { git } from "../infrastructure/git/command.ts";
import { lock, lockPath } from "../infrastructure/git/lock.ts";
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
  if (inspection.resources?.complete === false)
    return "RESOURCE_ACTIVITY_UNKNOWN";
  if (
    inspection.resources?.entries.some(
      (resource) => resource.record?.workspace === entry.path,
    )
  )
    return "RESOURCE_ACTIVITY_RECORDED";
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

async function planRetentionOperation(
  options: RecoveryRetentionOptions,
): Promise<RecoveryRetentionPlan> {
  if (options.transporter) return planTransportRetention(options);
  retentionPolicy(options.policy);
  const policy = structuredClone(options.policy);
  const inspection = await inspectRecovery({
    ...options,
    git: true,
    locks: true,
    resources: true,
  });
  const entries: RecoveryRetentionEntry[] = [];
  const inspectedAt = new Date().toISOString();
  let complete = inspection.complete && inspection.git?.complete !== false;
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
  const logs = await planTransportRetention({
    transporter: repositoryTransport(inspection.repository),
    policy: {
      version: 1,
      scopes: policy.scopes.filter((scope) => scope === "closed-logs"),
      minAgeMs: policy.minAgeMs,
    },
    ...(options.maxEntries === undefined
      ? {}
      : { maxEntries: options.maxEntries }),
  });
  for (const entry of logs.entries.filter(
    (entry) => entry.category === "logs",
  )) {
    let bytes = 0;
    for (const object of entry.objects ?? []) {
      try {
        bytes += (
          await lstat(
            join(
              inspection.repository,
              ".outpost",
              repositoryStorageDirectory,
              "objects",
              `${object.key}.object`,
            ),
          )
        ).size;
      } catch {
        complete = false;
      }
    }
    const container = entries.findIndex(
      (value) =>
        value.category === "storage" &&
        value.path ===
          join(
            inspection.repository,
            ".outpost",
            repositoryStorageDirectory,
            "objects",
          ),
    );
    const stored = entries[container];
    if (!stored || stored.bytes < bytes) complete = false;
    if (stored)
      entries[container] = {
        ...stored,
        bytes: Math.max(0, stored.bytes - bytes),
      };
    entries.push({ ...entry, bytes, eligible: entry.eligible && complete });
  }
  complete = complete && logs.complete;
  if (!complete) {
    for (let index = 0; index < entries.length; index++) {
      const entry = entries[index]!;
      if (entry.eligible)
        entries[index] = {
          ...entry,
          eligible: false,
          reason: "INCOMPLETE_INVENTORY",
        };
    }
  }
  const projectedBytes =
    inspection.usage.bytes -
    entries
      .filter((entry) => entry.eligible)
      .reduce((sum, entry) => sum + entry.bytes, 0);
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

async function pruneRetentionOperation(
  plan: RecoveryRetentionPlan,
  options?: TransportStoreOptions,
): Promise<RecoveryPruneResult> {
  if (plan.source === "transport") {
    invariant(options, "Transport retention requires its transporter");
    return pruneTransportRetention(plan, options);
  }
  invariant(!options, "Local retention does not accept a transporter");
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
        const result = await pruneTransportRetention(
          {
            ...plan,
            source: "transport",
            policy: {
              version: 1,
              scopes: ["closed-logs"],
              minAgeMs: plan.policy.minAgeMs,
            },
            entries: [candidate],
          },
          { transporter: repositoryTransport(plan.repository) },
        );
        if (!result.removed.includes(entry.path)) {
          retained.push(...result.retained);
          continue;
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

export function planRecoveryRetention(
  options: RecoveryRetentionOptions,
  observation?: ObservationHub,
): Promise<RecoveryRetentionPlan> {
  return observedOperation(observation, "recovery", "retention.plan", () =>
    planRetentionOperation(options),
  );
}

export function pruneRecoveryRetention(
  plan: RecoveryRetentionPlan,
  options?: TransportStoreOptions,
  observation?: ObservationHub,
): Promise<RecoveryPruneResult> {
  return observedOperation(observation, "recovery", "retention.prune", () =>
    pruneRetentionOperation(plan, options),
  );
}
