import { mkdir, lstat, open, rename, rm, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { setTimeout } from "node:timers/promises";
import {
  TransportConflict,
  transportKey,
  transportCondition,
} from "../domain/transport.ts";
import type {
  Transport,
  TransportWriteOptions,
} from "../domain/transport.types.ts";
import type { LocalTransportOptions } from "./local-transport.types.ts";
import { lock } from "./git/lock.ts";
import { OutpostError } from "../domain/errors.ts";
import { readInspectionFile } from "./inspection-file.ts";
import { decodeObject, encodeObject, readLimit } from "./transport-envelope.ts";
import { transportDefaults } from "./transport.constants.ts";

async function privateDirectory(path: string): Promise<void> {
  const parent = dirname(path);
  if (parent !== path) {
    await privateDirectory(parent);
    await mkdir(path, { recursive: true, mode: 0o700 });
  }
  if (!(await lstat(path)).isDirectory())
    throw new Error("Transport directories must not be symlinks");
}

export function localTransport(options: LocalTransportOptions): Transport {
  const root = resolve(options.directory),
    objects = join(root, "objects");
  const path = (key: string) => join(objects, `${transportKey(key)}.object`);
  const read: Transport["read"] = async (key, options = {}) => {
    options.signal?.throwIfAborted();
    const limit = readLimit(options.maxBytes);
    try {
      const target = path(key);
      const info = await lstat(target);
      const data = await readInspectionFile(
        target,
        Math.min(info.size, limit + transportDefaults.headerBytes) || 1,
      );
      options.signal?.throwIfAborted();
      return decodeObject(data, key, limit);
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "ENOENT"
      )
        return undefined;
      throw error;
    }
  };
  async function mutate<T>(
    key: string,
    options: TransportWriteOptions,
    action: () => Promise<T>,
  ): Promise<T> {
    transportKey(key);
    transportCondition(options.ifRevision);
    await privateDirectory(root);
    const signal = AbortSignal.any([
      AbortSignal.timeout(transportDefaults.lockMs),
      ...(options.signal ? [options.signal] : []),
    ]);
    let release: (() => Promise<void>) | undefined;
    while (!release) {
      signal.throwIfAborted();
      try {
        release = await lock(root, key);
      } catch (error) {
        if (!(error instanceof OutpostError) || error.code !== "conflict")
          throw error;
        await setTimeout(transportDefaults.retryMs, undefined, { signal });
      }
    }
    try {
      if ((await read(key))?.revision !== (options.ifRevision ?? undefined))
        throw new TransportConflict(key);
      options.signal?.throwIfAborted();
      return await action();
    } finally {
      await release();
    }
  }
  return {
    name: "local",
    read,
    write(key, input, options) {
      const bytes = Buffer.from(input);
      return mutate(key, options, async () => {
        const target = path(key);
        await privateDirectory(dirname(target));
        const { entry, data } = encodeObject(key, bytes);
        const temporary = `${target}.${randomUUID()}.tmp`;
        try {
          const file = await open(temporary, "wx", 0o600);
          try {
            await file.writeFile(data, { signal: options.signal });
            await file.sync();
          } finally {
            await file.close();
          }
          options.signal?.throwIfAborted();
          await rename(temporary, target);
          if (process.platform !== "win32") {
            const parent = await open(dirname(target), "r");
            try {
              await parent.sync();
            } finally {
              await parent.close();
            }
          }
          return entry;
        } finally {
          await rm(temporary, { force: true });
        }
      });
    },
    remove(key, options) {
      if (options.ifRevision === null)
        return Promise.reject(
          new Error("Transport removal requires an existing revision"),
        );
      return mutate(key, options, () => rm(path(key), { force: true }));
    },
    async *list(prefix = "", options = {}) {
      if (prefix) transportKey(prefix.replace(/\/$/, ""));
      async function* scan(
        directory: string,
        base: string,
      ): AsyncIterable<string> {
        const entries = await readdir(directory, { withFileTypes: true }).catch(
          (error) => {
            if (error.code === "ENOENT") return [];
            throw error;
          },
        );
        for (const entry of entries) {
          options.signal?.throwIfAborted();
          const name = `${base}${entry.name}`;
          if (entry.isDirectory())
            yield* scan(join(directory, entry.name), `${name}/`);
          if (entry.isFile() && name.endsWith(".object"))
            yield name.slice(0, -7);
          if (entry.isSymbolicLink())
            throw new Error("Transport objects must not be symlinks");
        }
      }
      for await (const key of scan(objects, "")) {
        if (!key.startsWith(prefix)) continue;
        const object = await read(
          key,
          options.signal ? { signal: options.signal } : {},
        );
        if (object) {
          const { bytes: _bytes, ...entry } = object;
          yield entry;
        }
      }
    },
  };
}
