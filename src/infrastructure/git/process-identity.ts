import { createHash } from "node:crypto";
import { readFile, readlink } from "node:fs/promises";
import type {
  LocalProcessIdentity,
  LockOwnership,
} from "./process-identity.types.ts";

export async function localProcessIdentity(
  pid = process.pid,
): Promise<LocalProcessIdentity | undefined> {
  if (process.platform !== "linux") return undefined;
  try {
    const [machine, boot, namespace, stat] = await Promise.all([
      readFile("/etc/machine-id", "utf8"),
      readFile("/proc/sys/kernel/random/boot_id", "utf8"),
      readlink(`/proc/${pid}/ns/pid`),
      readFile(`/proc/${pid}/stat`, "utf8"),
    ]);
    const started = stat.slice(stat.lastIndexOf(")") + 2).split(" ")[19];
    if (!machine.trim() || !boot.trim() || !started || !/^\d+$/.test(started))
      return undefined;
    return {
      host: createHash("sha256").update(machine.trim()).digest("hex"),
      boot: boot.trim(),
      namespace,
      started,
    };
  } catch {
    return undefined;
  }
}

function validIdentity(value: unknown): value is LocalProcessIdentity {
  if (!value || typeof value !== "object") return false;
  return (
    "host" in value &&
    typeof value.host === "string" &&
    value.host.length > 0 &&
    "boot" in value &&
    typeof value.boot === "string" &&
    value.boot.length > 0 &&
    "namespace" in value &&
    typeof value.namespace === "string" &&
    value.namespace.length > 0 &&
    "started" in value &&
    typeof value.started === "string" &&
    /^\d+$/.test(value.started)
  );
}

export async function observeOwnership(
  pid: number,
  identity: unknown,
): Promise<LockOwnership> {
  if (!validIdentity(identity))
    return { status: "unknown", reason: "LEGACY_OR_INVALID_IDENTITY" };
  const local = await localProcessIdentity();
  if (!local)
    return { status: "unknown", reason: "LOCAL_IDENTITY_UNAVAILABLE" };
  if (identity.host !== local.host)
    return { status: "unknown", reason: "OTHER_HOST" };
  if (identity.boot !== local.boot)
    return { status: "unknown", reason: "OTHER_BOOT" };
  if (identity.namespace !== local.namespace)
    return { status: "unknown", reason: "OTHER_PID_NAMESPACE" };
  try {
    process.kill(pid, 0);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ESRCH"
    )
      return { status: "inactive", reason: "PROCESS_EXITED" };
    return { status: "unknown", reason: "PROCESS_INACCESSIBLE" };
  }
  const current = await localProcessIdentity(pid);
  if (!current)
    return { status: "unknown", reason: "PROCESS_IDENTITY_UNAVAILABLE" };
  if (current.started !== identity.started)
    return { status: "unknown", reason: "PID_REUSED" };
  return { status: "active", reason: "LOCAL_IDENTITY_MATCH" };
}
