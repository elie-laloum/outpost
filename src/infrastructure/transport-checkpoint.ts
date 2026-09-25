import { createHash, randomUUID } from "node:crypto";
import type { WorkflowCheckpointStore } from "../domain/workflow/checkpoint.types.ts";
import type { TransportStoreOptions } from "../domain/transport.types.ts";
import { TransportConflict } from "../domain/transport.ts";
import { jsonBytes, jsonObject } from "./transport-json.ts";
import { workflowCheckpointMaxBytes } from "./workflow-checkpoint.constants.ts";
import type {
  CheckpointEnvelope,
  CheckpointRecoveryOptions,
} from "./transport-checkpoint.types.ts";

function key(runId: string): string {
  if (!runId.trim()) throw new Error("Checkpoint runId must not be empty");
  return `checkpoints/${createHash("sha256").update(runId).digest("hex")}.json`;
}

function envelope(value: unknown): CheckpointEnvelope {
  if (value === undefined) return { owner: null };
  if (
    !value ||
    typeof value !== "object" ||
    !("owner" in value) ||
    (value.owner !== null && typeof value.owner !== "string")
  )
    throw new Error("Invalid checkpoint ownership envelope");
  return {
    owner: value.owner,
    ...("checkpoint" in value ? { checkpoint: value.checkpoint } : {}),
  };
}

export function workflowCheckpointStore(
  options: TransportStoreOptions,
): WorkflowCheckpointStore {
  const { transporter } = options;
  return {
    async acquire(runId) {
      const target = key(runId);
      const previous = await transporter.read(target, {
        maxBytes: workflowCheckpointMaxBytes + 1024,
      });
      let data = envelope(jsonObject(previous));
      if (data.owner !== null)
        throw new Error("Workflow is already in use or ownership is unknown");
      const owner = randomUUID();
      data = { ...data, owner };
      let revision = (
        await transporter.write(target, jsonBytes(data), {
          ifRevision: previous?.revision ?? null,
        })
      ).revision;
      let released = false;
      let pending = Promise.resolve();
      let closing: Promise<void> | undefined;
      async function owned() {
        if (released) throw new Error("Checkpoint lease has been released");
        const current = await transporter.read(target, {
          maxBytes: workflowCheckpointMaxBytes + 1024,
        });
        if (
          current?.revision !== revision ||
          envelope(jsonObject(current)).owner !== owner
        )
          throw new TransportConflict(target);
      }
      return {
        async read() {
          await pending;
          await owned();
          return structuredClone(data.checkpoint);
        },
        async write(checkpoint) {
          if (closing)
            return Promise.reject(
              new Error("Checkpoint lease has been released"),
            );
          const bytes = jsonBytes(checkpoint);
          if (bytes.byteLength > workflowCheckpointMaxBytes)
            return Promise.reject(
              new Error(
                "Workflow checkpoint exceeds 16 MiB; store large artifacts separately",
              ),
            );
          const next = {
            owner,
            checkpoint: JSON.parse(Buffer.from(bytes).toString()) as unknown,
          };
          const operation = pending.then(async () => {
            await owned();
            revision = (
              await transporter.write(target, jsonBytes(next), {
                ifRevision: revision,
              })
            ).revision;
            data = next;
          });
          pending = operation.catch(() => {});
          return operation;
        },
        release() {
          closing ??= (async () => {
            await pending;
            if (released) return;
            await owned();
            await transporter.write(
              target,
              jsonBytes({ ...data, owner: null }),
              { ifRevision: revision },
            );
            released = true;
          })();
          return closing;
        },
      };
    },
  };
}

export async function recoverWorkflowCheckpoint(
  options: CheckpointRecoveryOptions,
): Promise<void> {
  const target = key(options.runId);
  const current = await options.transporter.read(target, {
    maxBytes: workflowCheckpointMaxBytes + 1024,
  });
  if (!current || current.revision !== options.revision)
    throw new TransportConflict(target);
  const data = envelope(jsonObject(current));
  await options.transporter.write(target, jsonBytes({ ...data, owner: null }), {
    ifRevision: current.revision,
  });
}
