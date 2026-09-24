import { createHash, randomUUID } from "node:crypto";
import { mkdir, open, rm } from "node:fs/promises";
import { join } from "node:path";
import { OutpostError } from "../../domain/errors.ts";
import { localProcessIdentity, observeOwnership } from "./process-identity.ts";
import { readInspectionFile } from "../inspection-file.ts";
import { lockInspectionDefaults } from "./lock-inspection.constants.ts";

export function lockPath(root: string, key: string): string {
  return join(
    root,
    ".outpost",
    "locks",
    `${createHash("sha256").update(key).digest("hex").slice(0, 20)}.json`,
  );
}

async function readOwner(path: string): Promise<unknown> {
  return JSON.parse(
    (await readInspectionFile(path, lockInspectionDefaults.maxBytes)).toString(
      "utf8",
    ),
  );
}

async function createLock(path: string): Promise<() => Promise<void>> {
  const file = await open(path, "wx", 0o600);
  const nonce = randomUUID();
  try {
    await file.writeFile(
      JSON.stringify({
        pid: process.pid,
        nonce,
        identity: await localProcessIdentity(),
      }),
    );
  } finally {
    await file.close();
  }
  return async () => {
    const current = await readOwner(path).catch(() => null);
    if (
      current &&
      typeof current === "object" &&
      "nonce" in current &&
      current.nonce === nonce
    )
      await rm(path, { force: true });
  };
}

export async function lock(
  root: string,
  key: string,
): Promise<() => Promise<void>> {
  await mkdir(join(root, ".outpost", "locks"), { recursive: true });
  const path = lockPath(root, key);
  try {
    return await createLock(path);
  } catch (cause) {
    if (!(
      cause &&
      typeof cause === "object" &&
      "code" in cause &&
      cause.code === "EEXIST"
    ))
      throw cause;
  }
  const conflict = () =>
    new OutpostError(
      "conflict",
      `Workspace is already in use or ownership is unknown: ${key}`,
      { lock: path },
    );
  // Serialize stale reclamation so another contender cannot unlink a new owner.
  const releaseGuard = await createLock(`${path}.reclaim`).catch(() => {
    throw conflict();
  });
  try {
    const owner = await readOwner(path).catch(() => null);
    const pid =
      owner && typeof owner === "object" && "pid" in owner
        ? owner.pid
        : undefined;
    const identity =
      owner && typeof owner === "object" && "identity" in owner
        ? owner.identity
        : undefined;
    const ownership =
      typeof pid === "number" &&
      Number.isSafeInteger(pid) &&
      pid > 0 &&
      pid <= lockInspectionDefaults.maxPid
        ? await observeOwnership(pid, identity)
        : undefined;
    if (ownership?.status !== "inactive") throw conflict();
    await rm(path, { force: true });
    return await createLock(path);
  } finally {
    await releaseGuard();
  }
}
