import { lstat, opendir, realpath } from "node:fs/promises";
import { join } from "node:path";
import { invariant, positive } from "../domain/errors.ts";
import { observeOwnership } from "./git/process-identity.ts";
import type { LocalProcessIdentity } from "./git/process-identity.types.ts";
import { readInspectionFile } from "./inspection-file.ts";
import {
  resourceActivityDefaults as defaults,
  resourceOperationKinds,
  resourcePhases,
} from "./resource-activity.constants.ts";
import type {
  ResourceActivityRecord,
  ResourceInspection,
  ResourceInspectionEntry,
  ResourceOperation,
  ResourceOperationResult,
} from "./resource-activity.types.ts";
import type { StorageIssue } from "./storage-inventory.types.ts";

function object(value: unknown): asserts value is Record<string, unknown> {
  invariant(
    !!value && typeof value === "object" && !Array.isArray(value),
    "Invalid activity object",
  );
}
function text(value: unknown): asserts value is string {
  invariant(
    typeof value === "string" &&
      value.length > 0 &&
      value.length <= defaults.maxText,
    "Invalid activity text",
  );
}
function date(value: unknown): asserts value is string {
  text(value);
  invariant(Number.isFinite(Date.parse(value)), "Invalid activity time");
}
function operation(value: unknown): ResourceOperation {
  object(value);
  invariant(
    typeof value.count === "number" &&
      Number.isSafeInteger(value.count) &&
      value.count > 0,
    "Invalid activity count",
  );
  date(value.startedAt);
  const kind = resourceOperationKinds.find((kind) => kind === value.kind);
  invariant(kind, "Invalid activity operation");
  return { count: value.count, startedAt: value.startedAt, kind };
}
function result(value: unknown): ResourceOperationResult {
  const base = operation(value);
  object(value);
  text(value.id);
  date(value.finishedAt);
  invariant(
    value.outcome === "completed" || value.outcome === "failed",
    "Invalid activity outcome",
  );
  return {
    ...base,
    id: value.id,
    finishedAt: value.finishedAt,
    outcome: value.outcome,
  };
}
function identity(value: unknown): LocalProcessIdentity | undefined {
  if (value === undefined) return undefined;
  object(value);
  text(value.host);
  text(value.boot);
  text(value.namespace);
  text(value.started);
  return {
    host: value.host,
    boot: value.boot,
    namespace: value.namespace,
    started: value.started,
  };
}
export function resourceRecord(value: unknown): ResourceActivityRecord {
  object(value);
  invariant(value.version === 1, "Unknown activity version");
  text(value.id);
  text(value.provider);
  text(value.workspace);
  date(value.createdAt);
  date(value.updatedAt);
  invariant(
    typeof value.pid === "number" &&
      Number.isSafeInteger(value.pid) &&
      value.pid > 0 &&
      value.pid <= 2_147_483_647,
    "Invalid activity owner",
  );
  invariant(
    value.placement === "host" ||
      value.placement === "mounted" ||
      value.placement === "remote",
    "Invalid activity placement",
  );
  const phase = resourcePhases.find((phase) => phase === value.phase);
  invariant(phase, "Invalid activity phase");
  invariant(
    Array.isArray(value.operations) &&
      value.operations.length <= resourceOperationKinds.length,
    "Invalid activity operations",
  );
  const owner = identity(value.identity);
  return {
    version: 1,
    id: value.id,
    pid: value.pid,
    ...(owner ? { identity: owner } : {}),
    provider: value.provider,
    placement: value.placement,
    workspace: value.workspace,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    phase,
    operations: value.operations.map(operation),
    ...(value.lastOperation === undefined
      ? {}
      : { lastOperation: result(value.lastOperation) }),
    ...(value.lastFailure === undefined
      ? {}
      : { lastFailure: result(value.lastFailure) }),
  };
}

export async function inspectResourceActivity(
  repository: string,
  maxEntries: number = defaults.maxRecords,
): Promise<ResourceInspection> {
  positive(maxEntries, "maxEntries");
  const entries: ResourceInspectionEntry[] = [];
  const issues: StorageIssue[] = [];
  let path = repository;
  try {
    for (const part of [".outpost", "locks", defaults.directory]) {
      path = join(path, part);
      const info = await lstat(path);
      invariant(
        info.isDirectory() &&
          !info.isSymbolicLink() &&
          (await realpath(path)) === path,
        "Unsafe activity directory",
      );
    }
    for await (const entry of await opendir(path)) {
      const file = join(path, entry.name);
      if (entries.length >= Math.min(maxEntries, defaults.maxRecords)) {
        issues.push({ path, code: "RESOURCE_ENTRY_LIMIT" });
        break;
      }
      try {
        const value = resourceRecord(
          JSON.parse(
            (await readInspectionFile(file, defaults.maxRecordBytes)).toString(
              "utf8",
            ),
          ),
        );
        invariant(
          entry.name === `${value.id}.json`,
          "Activity identity mismatch",
        );
        entries.push({
          path: file,
          record: value,
          ownership: await observeOwnership(value.pid, value.identity),
        });
      } catch {
        entries.push({
          path: file,
          ownership: {
            status: "unknown",
            reason: "RESOURCE_RECORD_UNREADABLE",
          },
        });
        issues.push({ path: file, code: "RESOURCE_RECORD_UNREADABLE" });
      }
    }
  } catch (cause) {
    if (!(
      cause &&
      typeof cause === "object" &&
      "code" in cause &&
      cause.code === "ENOENT"
    ))
      issues.push({ path, code: "RESOURCE_DIRECTORY_UNAVAILABLE" });
  }
  entries.sort((left, right) => left.path.localeCompare(right.path));
  return {
    scope: "recorded-sandboxes",
    complete: issues.length === 0,
    entries,
    issues,
  };
}
