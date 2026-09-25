import { transportDefaults } from "../infrastructure/transport.constants.ts";
import type {
  RecoveryInspection,
  RecoveryInspectionOptions,
} from "./recovery-inspection.types.ts";
import type {
  StorageCategory,
  StorageEntry,
  StorageUsage,
} from "../infrastructure/storage-inventory.types.ts";
import type { ResourceInspectionEntry } from "../infrastructure/resource-activity.types.ts";
import { resourceRecord } from "../infrastructure/resource-activity-inspection.ts";
import { jsonObject } from "../infrastructure/transport-json.ts";
import { invariant, positive } from "../domain/errors.ts";
import { transportCategories } from "./transport-inspection.constants.ts";

export async function inspectTransportRecovery(
  options: RecoveryInspectionOptions,
): Promise<RecoveryInspection> {
  const transporter = options.transporter;
  invariant(transporter, "Transport is required");
  invariant(
    !options.git && !options.locks,
    "Transport inspection cannot verify host Git or process locks",
  );
  const maxEntries = positive(
    options.maxEntries ?? transportDefaults.maxEntries,
    "maxEntries",
  );
  const buckets = transportCategories.map((name) => ({
    name,
    path: name,
    entries: [] as StorageEntry[],
  }));
  const categories: StorageCategory[] = buckets;
  const usage: StorageUsage = {
    bytes: 0,
    files: 0,
    directories: 0,
    symlinks: 0,
    other: 0,
  };
  const issues = [];
  const resources: ResourceInspectionEntry[] = [];
  let scannedEntries = 0,
    complete = true;
  for await (const entry of transporter.list()) {
    if (scannedEntries >= maxEntries) {
      complete = false;
      issues.push({ path: "", code: "ENTRY_LIMIT" });
      break;
    }
    scannedEntries++;
    const name = entry.key.split("/")[0];
    const category = buckets.find((category) => category.name === name);
    if (!category) {
      complete = false;
      issues.push({ path: entry.key, code: "UNKNOWN_TRANSPORT_CATEGORY" });
      continue;
    }
    const stored = {
      name: entry.key,
      path: entry.key,
      kind: "file" as const,
      modifiedAt: entry.modifiedAt,
      complete: true,
      bytes: entry.size,
      files: 1,
      directories: 0,
      symlinks: 0,
      other: 0,
      revision: entry.revision,
    };
    category.entries.push(stored);
    usage.bytes += entry.size;
    usage.files++;
    if (options.resources && name === "resources") {
      try {
        const object = await transporter.read(entry.key);
        invariant(
          object?.revision === entry.revision,
          "Resource changed during inspection",
        );
        const record = resourceRecord(jsonObject(object));
        resources.push({
          path: entry.key,
          record,
          ownership: { status: "unknown", reason: "REMOTE_OWNER_UNVERIFIED" },
        });
      } catch {
        issues.push({ path: entry.key, code: "RESOURCE_RECORD_UNREADABLE" });
        complete = false;
        resources.push({
          path: entry.key,
          ownership: {
            status: "unknown",
            reason: "RESOURCE_RECORD_UNREADABLE",
          },
        });
      }
    }
  }
  return {
    repository: options.repository ?? "",
    root: "transport",
    activity: "unverified",
    categories,
    usage,
    issues,
    complete,
    scannedEntries,
    maxEntries,
    ...(options.resources
      ? {
          resources: {
            scope: "recorded-sandboxes",
            complete,
            entries: resources,
            issues,
          },
        }
      : {}),
  };
}
