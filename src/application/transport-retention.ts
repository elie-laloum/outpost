import { invariant } from "../domain/errors.ts";
import type {
  TransportStoreOptions,
  TransportEntry,
} from "../domain/transport.types.ts";
import type {
  RecoveryRetentionOptions,
  RecoveryRetentionPlan,
  RecoveryRetentionEntry,
  RecoveryPruneResult,
} from "./recovery-retention.types.ts";
import { inspectTransportRecovery } from "./transport-inspection.ts";
import { journalSnapshot } from "../infrastructure/transport-journal.ts";
import { jsonObject } from "../infrastructure/transport-json.ts";
import { retentionPolicy } from "./recovery-retention-policy.ts";

export async function planTransportRetention(
  options: RecoveryRetentionOptions,
): Promise<RecoveryRetentionPlan> {
  const transporter = options.transporter;
  invariant(transporter, "Transport is required");
  retentionPolicy(options.policy);
  invariant(
    !options.policy.scopes.includes("clean-workspaces") &&
      options.policy.maxWorkspaces === undefined,
    "Transport retention cannot inspect local workspaces",
  );
  const inspection = await inspectTransportRecovery(options);
  const inspectedAt = new Date().toISOString();
  const entries: RecoveryRetentionEntry[] = [];
  const handled = new Set<string>();
  for (const category of inspection.categories) {
    for (const entry of category.entries) {
      if (handled.has(entry.path)) continue;
      let eligible = false,
        reason = "RECOVERY_DATA_PROTECTED";
      let objects: TransportEntry[] = [];
      if (category.name === "logs") {
        const prefix = entry.path.slice(0, entry.path.lastIndexOf("/") + 1);
        const group = category.entries.filter((value) =>
          value.path.startsWith(prefix),
        );
        objects = group.map((value) => {
          invariant(
            value.revision && value.modifiedAt,
            "Missing transport entry version",
          );
          return {
            key: value.path,
            revision: value.revision,
            size: value.bytes,
            modifiedAt: value.modifiedAt,
          };
        });
        for (const object of objects) handled.add(object.key);
        const index = group.find((value) => value.path === prefix + "index");
        reason = "LOG_ACTIVITY_OR_CONTENT_UNKNOWN";
        if (index && options.policy.scopes.includes("closed-logs")) {
          try {
            const current = await transporter.read(index.path);
            if (
              current?.revision === index.revision &&
              journalSnapshot(jsonObject(current)).closed
            ) {
              eligible =
                inspection.complete &&
                objects.every(
                  (value) =>
                    Date.parse(inspectedAt) - Date.parse(value.modifiedAt) >=
                    options.policy.minAgeMs,
                );
              reason = eligible
                ? "ELIGIBLE"
                : "RETENTION_AGE_OR_INCOMPLETE_INVENTORY";
            }
          } catch {
            reason = "LOG_ACTIVITY_OR_CONTENT_UNKNOWN";
          }
        }
        const indexObject = objects.find(
          (value) => value.key === prefix + "index",
        );
        entries.push({
          path: prefix + "index",
          category: category.name,
          bytes: objects.reduce((sum, value) => sum + value.size, 0),
          eligible,
          reason,
          objects,
          ...(indexObject
            ? {
                revision: indexObject.revision,
                modifiedAt: indexObject.modifiedAt,
              }
            : {}),
        });
        continue;
      }
      entries.push({
        path: entry.path,
        category: category.name,
        bytes: entry.bytes,
        eligible,
        reason,
        ...(entry.revision ? { revision: entry.revision } : {}),
        ...(entry.modifiedAt ? { modifiedAt: entry.modifiedAt } : {}),
      });
    }
  }
  const projectedBytes =
    inspection.usage.bytes -
    entries
      .filter((entry) => entry.eligible)
      .reduce((sum, entry) => sum + entry.bytes, 0);
  return {
    repository: inspection.repository,
    source: "transport",
    policy: structuredClone(options.policy),
    inspectedAt,
    inspection,
    entries,
    complete: inspection.complete,
    usageBytes: inspection.usage.bytes,
    projectedBytes,
    quota: !inspection.complete
      ? "unknown"
      : options.policy.maxBytes !== undefined &&
          projectedBytes > options.policy.maxBytes
        ? "exceeded"
        : "within",
  };
}

export async function pruneTransportRetention(
  plan: RecoveryRetentionPlan,
  options: TransportStoreOptions,
): Promise<RecoveryPruneResult> {
  invariant(plan.complete, "Cannot prune an incomplete retention plan");
  retentionPolicy(plan.policy);
  const removed: string[] = [],
    retained = [];
  for (const candidate of plan.entries.filter((entry) => entry.eligible)) {
    const fresh = await planTransportRetention({
      transporter: options.transporter,
      policy: plan.policy,
      repository: plan.repository,
    });
    const entry = fresh.entries.find((entry) => entry.path === candidate.path);
    if (
      !entry?.eligible ||
      entry.revision !== candidate.revision ||
      JSON.stringify(entry.objects) !== JSON.stringify(candidate.objects)
    ) {
      retained.push({ path: candidate.path, reason: "PLAN_CHANGED" });
      continue;
    }
    try {
      invariant(entry.revision && entry.objects, "Missing log revisions");
      await options.transporter.remove(entry.path, {
        ifRevision: entry.revision,
      });
      for (const object of entry.objects) {
        if (object.key !== entry.path)
          await options.transporter.remove(object.key, {
            ifRevision: object.revision,
          });
      }
      removed.push(entry.path);
    } catch {
      retained.push({
        path: entry.path,
        reason: "REVALIDATION_OR_REMOVAL_FAILED",
      });
    }
  }
  return {
    removed,
    retained,
    after: await planTransportRetention({
      transporter: options.transporter,
      policy: plan.policy,
      repository: plan.repository,
    }),
  };
}
