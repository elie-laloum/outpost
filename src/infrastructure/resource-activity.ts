import { TransportConflict } from "../domain/transport.ts";
import { jsonBytes } from "./transport-json.ts";
import { randomUUID } from "node:crypto";
import { mkdir, open, realpath, rename, rm, opendir } from "node:fs/promises";
import { join } from "node:path";
import { invariant } from "../domain/errors.ts";
import { localProcessIdentity } from "./git/process-identity.ts";
import { readInspectionFile } from "./inspection-file.ts";
import { lockStorageMutation } from "./storage-mutation-lock.ts";
import { resourceActivityDefaults as defaults } from "./resource-activity.constants.ts";
import type {
  ResourceActivity,
  ResourceActivityOptions,
  ResourceActivityRecord,
  ResourceOperationResult,
} from "./resource-activity.types.ts";

async function activityDirectory(repository: string): Promise<string> {
  let path = repository;
  for (const part of [".outpost", "locks", defaults.directory]) {
    path = join(path, part);
    await mkdir(path, { recursive: true, mode: 0o700 });
    invariant(
      (await realpath(path)) === path,
      "Resource activity directory must not use symlinks",
    );
  }
  return path;
}

export async function registerResourceActivity(
  options: ResourceActivityOptions,
): Promise<ResourceActivity> {
  for (const text of [options.workspace, options.provider])
    invariant(
      text.length > 0 && text.length <= defaults.maxText,
      "Resource activity metadata exceeds its size limit",
    );
  const remote = options.transporter;
  const directory = remote ? "" : await activityDirectory(options.repository);
  let revision: string | undefined;
  const id = randomUUID();
  const path = remote ? `resources/${id}.json` : join(directory, `${id}.json`);
  const createdAt = new Date().toISOString();
  const identity = await localProcessIdentity();
  let record: ResourceActivityRecord = {
    version: 1,
    id,
    pid: process.pid,
    ...(identity ? { identity } : {}),
    provider: options.provider,
    placement: options.placement,
    workspace: options.workspace,
    createdAt,
    updatedAt: createdAt,
    phase: "allocating",
    operations: [],
  };
  const unlock = remote
    ? async () => {}
    : await lockStorageMutation(options.repository);
  try {
    if (remote) {
      revision = (
        await remote.write(path, jsonBytes(record), { ifRevision: null })
      ).revision;
    }
    if (!remote) {
      let count = 0;
      for await (const _entry of await opendir(directory))
        invariant(
          ++count < defaults.maxRecords,
          "Too many resource activity records; inspect retained ownership before continuing",
        );
      const file = await open(path, "wx", 0o600);
      try {
        await file.writeFile(JSON.stringify(record));
        await file.sync();
      } finally {
        await file.close();
      }
    }
  } finally {
    await unlock();
  }
  let pending = Promise.resolve();
  let removed = false;
  function serialize(action: () => Promise<void>): Promise<void> {
    const next = pending.then(action);
    pending = next.catch(() => undefined);
    return next;
  }
  async function verify(): Promise<void> {
    invariant(!removed, "Resource activity is closed");
    if (remote) {
      if ((await remote.read(path))?.revision !== revision)
        throw new TransportConflict(path);
      return;
    }
    invariant(
      remote || (await realpath(directory)) === directory,
      "Resource activity directory changed",
    );
    invariant(!removed, "Resource activity is closed");
    const current = (
      await readInspectionFile(path, defaults.maxRecordBytes)
    ).toString("utf8");
    invariant(
      current === JSON.stringify(record),
      "Resource activity identity changed; refusing mutation",
    );
  }
  function update(next: () => ResourceActivityRecord): Promise<void> {
    return serialize(async () => {
      await verify();
      const value = { ...next(), updatedAt: new Date().toISOString() };
      const data = JSON.stringify(value);
      invariant(
        Buffer.byteLength(data) <= defaults.maxRecordBytes,
        "Resource activity record exceeds its size limit",
      );
      if (remote) {
        invariant(revision, "Resource revision unavailable");
        revision = (
          await remote.write(path, jsonBytes(value), { ifRevision: revision })
        ).revision;
        record = value;
        return;
      }
      const temporary = `${path}.${randomUUID()}.tmp`;
      const file = await open(temporary, "wx", 0o600);
      try {
        await file.writeFile(data);
        await file.sync();
        await file.close();
        await rename(temporary, path);
        record = value;
      } finally {
        await file.close();
        await rm(temporary, { force: true });
      }
    });
  }
  return {
    async idle() {
      await pending;
      return record.operations.length === 0;
    },
    phase: (phase) => update(() => ({ ...record, phase })),
    async run(kind, action) {
      const operation = {
        id: randomUUID(),
        kind,
        startedAt: new Date().toISOString(),
      };
      await update(() => {
        const active = record.operations.find((value) => value.kind === kind);
        const operations = record.operations.filter(
          (value) => value.kind !== kind,
        );
        operations.push({
          kind,
          startedAt: active?.startedAt ?? operation.startedAt,
          count: (active?.count ?? 0) + 1,
        });
        return { ...record, operations };
      });
      let outcome: ResourceOperationResult["outcome"] = "completed";
      try {
        return await action();
      } catch (cause) {
        outcome = "failed";
        throw cause;
      } finally {
        const result = {
          ...operation,
          outcome,
          count: 1,
          finishedAt: new Date().toISOString(),
        };
        try {
          await update(() => ({
            ...record,
            operations: record.operations.flatMap((value) => {
              if (value.kind !== kind) return [value];
              if (value.count === 1) return [];
              return [{ ...value, count: value.count - 1 }];
            }),
            lastOperation: result,
            ...(outcome === "failed" ? { lastFailure: result } : {}),
          }));
        } catch (cause) {
          if (outcome !== "failed") throw cause;
        }
      }
    },
    remove: () =>
      serialize(async () => {
        if (removed) return;
        invariant(
          record.operations.length === 0,
          "Resource operations remain unsettled; activity record retained",
        );
        try {
          await verify();
          if (remote) {
            invariant(revision, "Resource revision unavailable");
            await remote.remove(path, { ifRevision: revision });
          } else await rm(path);
        } catch (cause) {
          if (!(
            cause &&
            typeof cause === "object" &&
            "code" in cause &&
            cause.code === "ENOENT"
          ))
            throw cause;
        }
        removed = true;
      }),
  };
}
