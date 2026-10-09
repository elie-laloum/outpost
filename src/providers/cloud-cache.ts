import { randomUUID } from "node:crypto";
import { lstat, mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { invariant, OutpostError } from "../domain/errors.ts";
import { TransportConflict } from "../domain/transport.ts";
import type { Transport } from "../domain/transport.types.ts";
import type { SandboxContext, SandboxLease } from "../domain/sandbox.types.ts";
import {
  archiveFiles,
  restoreArchiveFiles,
} from "../infrastructure/transport-archive.ts";
import {
  jsonBytes,
  jsonObject,
  transportReference,
} from "../infrastructure/transport-json.ts";
import { quote } from "../infrastructure/process.ts";
import { cacheMounts, validateCacheDeclarations } from "./container-cache.ts";
import { cloudCacheDefaults as defaults } from "./cloud-cache.constants.ts";
import type { CloudDependencyCache } from "./cloud-cache.types.ts";

export function validateCloudCaches(
  caches: readonly CloudDependencyCache[],
): void {
  validateCacheDeclarations(caches);
  for (const cache of caches)
    invariant(
      cache.transport &&
        ["read", "write", "remove", "list"].every(
          (method) =>
            typeof Reflect.get(cache.transport, method) === "function",
        ),
      "Cloud dependency caches require a Transport",
    );
}

function cancellableTransport(
  transport: Transport,
  signal: AbortSignal,
): Transport {
  return {
    name: transport.name,
    read: (key, options) => {
      signal.throwIfAborted();
      return transport.read(key, { ...options, signal });
    },
    write: (key, bytes, options) => {
      signal.throwIfAborted();
      return transport.write(key, bytes, { ...options, signal });
    },
    remove: (key, options) => transport.remove(key, { ...options, signal }),
    list: (prefix, options) => transport.list(prefix, { ...options, signal }),
  };
}

export async function prepareCloudCaches(
  lease: SandboxLease,
  caches: readonly CloudDependencyCache[],
  context: SandboxContext,
  image: string,
): Promise<() => Promise<void>> {
  if (!caches.length) return async () => {};
  const signal = context.signal
    ? AbortSignal.any([
        context.signal,
        AbortSignal.timeout(defaults.deadlineMs),
      ])
    : AbortSignal.timeout(defaults.deadlineMs);
  const call = async (script: string, elevated = false) => {
    const result = await lease.invoke({
      executable: "sh",
      arguments: ["-c", script],
      elevated,
      signal,
      retain: defaults.userBytes,
    });
    if (result.status !== 0)
      throw new OutpostError(
        "provider",
        "Cloud dependency cache setup failed",
        {},
        result.stderr,
      );
    return result.stdout;
  };
  const ids = (await call('printf "%s:%s" "$(id -u)" "$(id -g)"')).trim();
  invariant(
    /^\d+:\d+$/.test(ids),
    "Cloud sandbox returned an invalid cache user",
  );
  const [uid, gid] = ids.split(":").map(Number);
  const mounts = await cacheMounts(
    caches,
    context.repository,
    image,
    {
      uid: uid!,
      gid: gid!,
    },
    context.workspaceIdentity,
  );
  const saves: (() => Promise<void>)[] = [];
  for (const [index, cache] of caches.entries()) {
    signal.throwIfAborted();
    const mount = mounts[index]!;
    const prefix = `${defaults.prefix}/${mount.volume}`;
    const key = `${prefix}/current`;
    const transport = cancellableTransport(cache.transport, signal);
    const current = await transport.read(key, {
      maxBytes: defaults.pointerBytes,
    });
    await call(
      `mkdir -p ${quote(mount.target)} && chown ${ids} ${quote(mount.target)} && chmod 700 ${quote(mount.target)}`,
      uid !== 0,
    );
    if (current) {
      const reference = transportReference(jsonObject(current));
      invariant(
        reference.key.startsWith(`${prefix}/snapshots/`) &&
          reference.key.endsWith("/manifest"),
        "Invalid dependency cache archive reference",
      );
      const staging = await mkdtemp(join(tmpdir(), "outpost-cache-"));
      try {
        const restored = join(staging, "restored");
        await restoreArchiveFiles(transport, reference, restored);
        await lease.upload(restored, mount.target, { signal });
      } finally {
        await rm(staging, { recursive: true, force: true });
      }
    }
    saves.push(async () => {
      // Cleanup has its own deadline so an aborted run can still publish downloads.
      const signal = AbortSignal.timeout(defaults.deadlineMs);
      const transport = cancellableTransport(cache.transport, signal);
      const staging = await mkdtemp(join(tmpdir(), "outpost-cache-"));
      try {
        const downloaded = join(staging, "downloaded");
        await lease.download(mount.target, downloaded, { signal });
        invariant(
          (await lstat(downloaded)).isDirectory(),
          "Dependency cache must remain a directory",
        );
        const entries = await readdir(downloaded, {
          recursive: true,
          withFileTypes: true,
        });
        const paths = entries
          .filter((entry) => !entry.isDirectory())
          .map((entry) =>
            relative(downloaded, join(entry.parentPath, entry.name)).replaceAll(
              "\\",
              "/",
            ),
          );
        const reference = await archiveFiles(
          transport,
          downloaded,
          paths,
          `${prefix}/snapshots/${randomUUID()}`,
        );
        try {
          await transport.write(key, jsonBytes(reference), {
            ifRevision: current?.revision ?? null,
          });
        } catch (cause) {
          if (!(cause instanceof TransportConflict)) throw cause;
        }
      } finally {
        await rm(staging, { recursive: true, force: true });
      }
    });
  }
  return async () => {
    const failures: unknown[] = [];
    for (const save of saves) {
      try {
        await save();
      } catch (cause) {
        failures.push(cause);
      }
    }
    if (failures.length)
      throw new AggregateError(failures, "Cloud dependency cache save failed");
  };
}

export async function releaseCloudSandbox(
  save: () => Promise<void>,
  stop: () => Promise<void>,
): Promise<void> {
  const failures: unknown[] = [];
  try {
    await save();
  } catch (cause) {
    failures.push(cause);
  }
  try {
    await stop();
  } catch (cause) {
    failures.push(cause);
  }
  if (failures.length === 1) throw failures[0];
  if (failures.length)
    throw new AggregateError(
      failures,
      "Cloud cache save or sandbox cleanup failed",
    );
}
