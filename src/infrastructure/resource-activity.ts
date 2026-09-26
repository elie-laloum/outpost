import { TransportConflict } from "../domain/transport.ts";
import { jsonBytes } from "./transport-json.ts";
import { randomUUID } from "node:crypto";
import { invariant } from "../domain/errors.ts";
import { localProcessIdentity } from "./git/process-identity.ts";
import { repositoryTransport } from "./repository-transport.ts";
import { resourceActivityDefaults as defaults } from "./resource-activity.constants.ts";
import type {
  ResourceActivity,
  ResourceActivityOptions,
  ResourceActivityRecord,
  ResourceOperationResult,
} from "./resource-activity.types.ts";

export async function registerResourceActivity(
  options: ResourceActivityOptions,
): Promise<ResourceActivity> {
  for (const text of [options.workspace, options.sandboxProvider])
    invariant(
      text.length > 0 && text.length <= defaults.maxText,
      "Resource activity metadata exceeds its size limit",
    );
  const transporter =
    options.transporter ?? repositoryTransport(options.repository);
  let revision: string | undefined;
  const id = randomUUID();
  const path = `resources/${id}.json`;
  const createdAt = new Date().toISOString();
  const identity = await localProcessIdentity();
  let record: ResourceActivityRecord = {
    version: 1,
    id,
    pid: process.pid,
    ...(identity ? { identity } : {}),
    sandboxProvider: options.sandboxProvider,
    placement: options.placement,
    workspace: options.workspace,
    createdAt,
    updatedAt: createdAt,
    phase: "allocating",
    operations: [],
  };
  let count = 0;
  for await (const _entry of transporter.list("resources/"))
    invariant(
      ++count < defaults.maxRecords,
      "Too many resource activity records; inspect retained ownership before continuing",
    );
  revision = (
    await transporter.write(path, jsonBytes(record), { ifRevision: null })
  ).revision;
  let pending = Promise.resolve();
  let removed = false;
  function serialize(action: () => Promise<void>): Promise<void> {
    const next = pending.then(action);
    pending = next.catch(() => undefined);
    return next;
  }
  async function verify(): Promise<void> {
    invariant(!removed, "Resource activity is closed");
    if ((await transporter.read(path))?.revision !== revision)
      throw new TransportConflict(path);
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
      invariant(revision, "Resource revision unavailable");
      revision = (
        await transporter.write(path, jsonBytes(value), {
          ifRevision: revision,
        })
      ).revision;
      record = value;
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
        if (!(await transporter.read(path))) {
          removed = true;
          return;
        }
        await verify();
        invariant(revision, "Resource revision unavailable");
        await transporter.remove(path, { ifRevision: revision });
        removed = true;
      }),
  };
}
