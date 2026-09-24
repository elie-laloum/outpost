import { randomUUID } from "node:crypto";
import { rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { safeDestination } from "../infrastructure/files.ts";
import { hashInspectionEntry } from "../infrastructure/inspection-hash.ts";
import { recoveryChecksumDefaults } from "./recovery-checksums.constants.ts";
import type {
  RecoveryChecksumEntry,
  RecoveryChecksumManifest,
} from "./recovery-checksums.types.ts";
import { recoveryChecksumPaths } from "./recovery-checksum-paths.ts";
import type { RecoveryTransferState } from "./recovery-verification.types.ts";

export async function captureRecoveryChecksums(
  root: string,
  state: RecoveryTransferState,
): Promise<void> {
  const entries: RecoveryChecksumEntry[] = [];
  for (const path of recoveryChecksumPaths(state))
    entries.push({
      path,
      ...(await hashInspectionEntry(await safeDestination(root, path))),
    });
  const manifest: RecoveryChecksumManifest = {
    version: 1,
    algorithm: "sha256",
    entries,
  };
  const temporary = join(root, `.checksums-${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, JSON.stringify(manifest), {
      flag: "wx",
      mode: 0o600,
    });
    await rename(temporary, join(root, recoveryChecksumDefaults.filename));
  } finally {
    await rm(temporary, { force: true });
  }
}
