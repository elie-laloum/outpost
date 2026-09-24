import { join } from "node:path";
import { OutpostError, positive } from "../domain/errors.ts";
import { safeDestination } from "../infrastructure/files.ts";
import { hashInspectionEntry } from "../infrastructure/inspection-hash.ts";
import { readInspectionFile } from "../infrastructure/inspection-file.ts";
import { recoveryChecksumPaths } from "./recovery-checksum-paths.ts";
import { recoveryChecksumDefaults } from "./recovery-checksums.constants.ts";
import type {
  RecoveryChecksumManifest,
  RecoveryChecksumResult,
} from "./recovery-checksums.types.ts";
import type {
  RecoveryStructureCheck,
  RecoveryTransferState,
} from "./recovery-verification.types.ts";

function validManifest(
  value: unknown,
  expected: readonly string[],
): value is RecoveryChecksumManifest {
  if (
    !value ||
    typeof value !== "object" ||
    !("version" in value) ||
    value.version !== 1 ||
    !("algorithm" in value) ||
    value.algorithm !== "sha256" ||
    !("entries" in value) ||
    !Array.isArray(value.entries) ||
    value.entries.length !== expected.length
  )
    return false;
  const remaining = new Set(expected);
  if (remaining.size !== expected.length) return false;
  const entries: readonly unknown[] = value.entries;
  for (const entry of entries) {
    if (
      !entry ||
      typeof entry !== "object" ||
      !("path" in entry) ||
      typeof entry.path !== "string" ||
      !remaining.delete(entry.path) ||
      !("kind" in entry) ||
      (entry.kind !== "file" && entry.kind !== "symlink") ||
      !("bytes" in entry) ||
      typeof entry.bytes !== "number" ||
      !Number.isSafeInteger(entry.bytes) ||
      entry.bytes < 0 ||
      !("sha256" in entry) ||
      typeof entry.sha256 !== "string" ||
      !/^[a-f0-9]{64}$/.test(entry.sha256)
    )
      return false;
  }
  return remaining.size === 0;
}

export async function verifyRecoveryChecksums(
  root: string,
  state: RecoveryTransferState,
  maxBytes: number = recoveryChecksumDefaults.maxBytes,
): Promise<RecoveryChecksumResult> {
  positive(maxBytes, "maxBytes");
  const checks: RecoveryStructureCheck[] = [];
  let bytesChecked = 0;
  const manifestPath = join(root, recoveryChecksumDefaults.filename);
  const unavailable = (code: string): RecoveryChecksumResult => ({
    integrity: "unverified",
    bytesChecked,
    maxBytes,
    checks: [{ path: manifestPath, status: "fail", code }],
  });
  let manifest: unknown;
  try {
    manifest = JSON.parse(
      (
        await readInspectionFile(
          manifestPath,
          recoveryChecksumDefaults.maxManifestBytes,
        )
      ).toString("utf8"),
    );
  } catch {
    return unavailable("CHECKSUMS_UNAVAILABLE");
  }
  if (!validManifest(manifest, recoveryChecksumPaths(state)))
    return unavailable("INVALID_CHECKSUM_MANIFEST");
  for (const entry of manifest.entries) {
    const path = join(root, entry.path);
    try {
      const actual = await hashInspectionEntry(
        await safeDestination(root, entry.path),
        maxBytes - bytesChecked,
      );
      bytesChecked += actual.bytes;
      const matches =
        actual.kind === entry.kind &&
        actual.bytes === entry.bytes &&
        actual.sha256 === entry.sha256;
      checks.push({
        path,
        status: matches ? "pass" : "fail",
        code: matches ? "CHECKSUM_MATCH" : "CHECKSUM_MISMATCH",
      });
    } catch (error) {
      const code =
        error instanceof OutpostError &&
        error.details.reason === "CHECKSUM_LIMIT"
          ? "CHECKSUM_LIMIT"
          : "CHECKSUM_UNAVAILABLE";
      checks.push({ path, status: "fail", code });
      return { integrity: "unverified", bytesChecked, maxBytes, checks };
    }
  }
  return {
    integrity: checks.every((check) => check.status === "pass")
      ? "checksums-match"
      : "checksums-mismatch",
    bytesChecked,
    maxBytes,
    checks,
  };
}
