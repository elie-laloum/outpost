import { verifyRecoveryChecksums } from "./recovery-checksums.ts";
import { positive } from "../domain/errors.ts";
import { lstat } from "node:fs/promises";
import { isAbsolute, join, win32 } from "node:path";
import { directory, safeDestination } from "../infrastructure/files.ts";
import { readInspectionFile } from "../infrastructure/inspection-file.ts";
import {
  recoveryTransferPatches,
  recoveryVerificationDefaults,
} from "./recovery-verification.constants.ts";
import type {
  RecoveryStructureCheck,
  RecoveryTransferState,
  RecoveryVerification,
  RecoveryVerificationOptions,
} from "./recovery-verification.types.ts";

function paths(value: unknown): value is readonly string[] {
  if (
    !Array.isArray(value) ||
    value.length > recoveryVerificationDefaults.maxPaths
  )
    return false;
  return (
    value.every(
      (path: unknown) =>
        typeof path === "string" &&
        path.length > 0 &&
        !path.includes("\0") &&
        !isAbsolute(path) &&
        !win32.parse(path).root &&
        !path
          .split(/[\\/]/)
          .some(
            (part) =>
              !part ||
              part === "." ||
              part === ".." ||
              part.toLowerCase() === ".git",
          ),
    ) && new Set(value).size === value.length
  );
}

function transferState(value: unknown): value is RecoveryTransferState {
  if (!value || typeof value !== "object") return false;
  if (
    !("previous" in value) ||
    !("next" in value) ||
    !("previousExtras" in value) ||
    !("incoming" in value)
  )
    return false;
  return (
    typeof value.previous === "string" &&
    /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(value.previous) &&
    typeof value.next === "string" &&
    /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(value.next) &&
    value.next.length === value.previous.length &&
    paths(value.previousExtras) &&
    paths(value.incoming)
  );
}

async function checkFile(
  root: string,
  name: string,
  allowSymlink = false,
): Promise<RecoveryStructureCheck> {
  try {
    const path = await safeDestination(root, name);
    const info = await lstat(path);
    if (allowSymlink && info.isSymbolicLink())
      return { path, status: "pass", code: "SYMLINK_PRESENT" };
    if (info.isFile()) return { path, status: "pass", code: "FILE_PRESENT" };
    return { path, status: "fail", code: "UNEXPECTED_TYPE" };
  } catch {
    return { path: join(root, name), status: "fail", code: "FILE_UNAVAILABLE" };
  }
}

export async function verifyRecoveryTransfer(
  path: string,
  options: RecoveryVerificationOptions = {},
): Promise<RecoveryVerification> {
  if (options.maxBytes !== undefined) positive(options.maxBytes, "maxBytes");
  const root = await directory(path);
  const checks: RecoveryStructureCheck[] = [];
  const report = (): RecoveryVerification => ({
    directory: root,
    scope: "transfer-structure",
    complete: checks.every((check) => check.status === "pass"),
    integrity: "unverified",
    checks,
  });
  const statePath = join(root, "state.json");
  let state: unknown;
  try {
    state = JSON.parse(
      (
        await readInspectionFile(
          statePath,
          recoveryVerificationDefaults.maxStateBytes,
        )
      ).toString("utf8"),
    );
  } catch {
    checks.push({ path: statePath, status: "fail", code: "STATE_UNAVAILABLE" });
    return report();
  }
  if (!transferState(state)) {
    checks.push({ path: statePath, status: "fail", code: "INVALID_STATE" });
    return report();
  }
  checks.push({
    path: statePath,
    status: "pass",
    code: "STATE_STRUCTURE_VALID",
  });
  for (const name of recoveryTransferPatches)
    checks.push(await checkFile(root, name));
  if (state.previous !== state.next)
    checks.push(await checkFile(root, "commits.bundle"));
  for (const name of state.previousExtras)
    checks.push(await checkFile(root, `previous-files/${name}`, true));
  for (const name of state.incoming)
    checks.push(await checkFile(root, `incoming/${name}`, true));
  if (options.checksums && checks.every((check) => check.status === "pass")) {
    const checksums = await verifyRecoveryChecksums(
      root,
      state,
      options.maxBytes,
    );
    checks.push(...checksums.checks);
    return { ...report(), integrity: checksums.integrity, checksums };
  }
  return report();
}
