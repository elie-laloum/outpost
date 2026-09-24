import { createHash } from "node:crypto";
import {
  cp,
  lstat,
  mkdir,
  mkdtemp,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { invariant, positive } from "../domain/errors.ts";
import { directory, safeDestination } from "../infrastructure/files.ts";
import { readInspectionFile } from "../infrastructure/inspection-file.ts";
import { recoveryChecksumPaths } from "./recovery-checksum-paths.ts";
import { recoveryChecksumDefaults } from "./recovery-checksums.constants.ts";
import { recoveryVerificationDefaults } from "./recovery-verification.constants.ts";
import {
  transferState,
  verifyRecoveryTransfer,
} from "./recovery-verification.ts";
import type { RecoveryRestoreSnapshot } from "./recovery-restore.types.ts";

export async function snapshotRecoveryTransfer(
  path: string,
  maxBytes: number = recoveryChecksumDefaults.maxBytes,
): Promise<RecoveryRestoreSnapshot> {
  positive(maxBytes, "maxBytes");
  const source = await directory(path);
  const stateBytes = await readInspectionFile(
    join(source, "state.json"),
    recoveryVerificationDefaults.maxStateBytes,
  );
  const state: unknown = JSON.parse(stateBytes.toString("utf8"));
  invariant(transferState(state), "Invalid recovery transfer state");
  const manifest = await readInspectionFile(
    join(source, recoveryChecksumDefaults.filename),
    recoveryChecksumDefaults.maxManifestBytes,
  );
  const snapshot = await realpath(
    await mkdtemp(join(tmpdir(), "outpost-restore-")),
  );
  const dispose = () =>
    rm(snapshot, { recursive: true, force: true, maxRetries: 3 });
  try {
    await writeFile(join(snapshot, "state.json"), stateBytes, { mode: 0o600 });
    await writeFile(
      join(snapshot, recoveryChecksumDefaults.filename),
      manifest,
      { mode: 0o600 },
    );
    let bytes = stateBytes.length;
    for (const entry of recoveryChecksumPaths(state).filter(
      (name) => name !== "state.json",
    )) {
      const from = await safeDestination(source, entry);
      const info = await lstat(from);
      invariant(
        info.isFile() || info.isSymbolicLink(),
        "Unsupported recovery payload type",
      );
      bytes += info.size;
      invariant(bytes <= maxBytes, "Recovery snapshot byte limit exceeded");
      const to = await safeDestination(snapshot, entry);
      await mkdir(dirname(to), { recursive: true, mode: 0o700 });
      await cp(from, to, {
        dereference: false,
        verbatimSymlinks: true,
        force: false,
        errorOnExist: true,
      });
    }
    const verified = await verifyRecoveryTransfer(snapshot, {
      checksums: true,
      maxBytes,
    });
    invariant(
      verified.complete && verified.integrity === "checksums-match",
      "Recovery snapshot integrity verification failed",
    );
    return {
      directory: snapshot,
      state,
      manifestSha256: createHash("sha256").update(manifest).digest("hex"),
      dispose,
    };
  } catch (error) {
    await dispose();
    throw error;
  }
}
