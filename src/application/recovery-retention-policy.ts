import { invariant } from "../domain/errors.ts";
import type { RecoveryRetentionPolicy } from "./recovery-retention.types.ts";

export function retentionPolicy(
  value: unknown,
): asserts value is RecoveryRetentionPolicy {
  invariant(
    !!value && typeof value === "object",
    "Retention policy must be an object",
  );
  invariant(
    "version" in value && value.version === 1,
    "Retention policy version must be 1",
  );
  invariant(
    "scopes" in value &&
      Array.isArray(value.scopes) &&
      value.scopes.length > 0 &&
      value.scopes.every(
        (scope: unknown) =>
          scope === "clean-workspaces" || scope === "closed-logs",
      ),
    "Retention scopes must contain clean-workspaces or closed-logs",
  );
  invariant(
    "minAgeMs" in value &&
      typeof value.minAgeMs === "number" &&
      Number.isSafeInteger(value.minAgeMs) &&
      value.minAgeMs >= 0,
    "minAgeMs must be a nonnegative integer",
  );
  for (const key of ["maxBytes", "maxWorkspaces"] as const) {
    if (!(key in value)) continue;
    const limit: unknown = Object.getOwnPropertyDescriptor(value, key)?.value;
    invariant(
      typeof limit === "number" && Number.isSafeInteger(limit) && limit >= 0,
      `${key} must be a nonnegative integer`,
    );
  }
  invariant(
    Object.keys(value).every((key) =>
      ["version", "scopes", "minAgeMs", "maxBytes", "maxWorkspaces"].includes(
        key,
      ),
    ),
    "Unsupported retention policy field",
  );
}
