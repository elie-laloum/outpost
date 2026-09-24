import { createHash } from "node:crypto";
import type { Task, WorkflowExecutionState } from "../workflow.types.ts";
import type {
  WorkflowCheckpoint,
  WorkflowCheckpointOptions,
  WorkflowCheckpointSession,
} from "./checkpoint.types.ts";
import { checkpointValue } from "./checkpoint-value.ts";
import { validateCheckpoint } from "./checkpoint-validation.ts";

export async function openCheckpoint(
  name: string,
  tasks: readonly Task[],
  options: WorkflowCheckpointOptions,
): Promise<WorkflowCheckpointSession> {
  if (!options.runId.trim() || !options.version.trim())
    throw new Error("Checkpoint runId and version must not be empty");
  const graph = tasks
    .map((item) => ({
      key: item.key,
      ...(item.gate ? { gate: item.gate } : {}),
      after: item.after.map((dependency) => dependency.key).sort(),
      timeoutMs: item.timeoutMs,
      retry: item.retry?.attempts,
      delayMs: item.retry?.delayMs,
      condition: !!item.condition,
      accepts: !!item.retry?.accepts,
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
  const identity = createHash("sha256")
    .update(JSON.stringify({ name, version: options.version, graph }))
    .digest("hex");
  const lease = await options.store.acquire(options.runId);
  try {
    const saved = await lease.read();
    let initial: WorkflowCheckpoint | undefined;
    if (saved !== undefined) {
      validateCheckpoint(saved, identity, tasks);
      initial = saved;
      const settledGate = saved.records.some((record) =>
        ["paused", "rejected"].includes(record.status),
      );
      if (
        saved.records.some(
          (record) =>
            !["done", "skipped", "paused", "rejected"].includes(
              record.status,
            ) &&
            !(
              settledGate &&
              record.status === "waiting" &&
              record.attempts === 0
            ),
        ) &&
        options.resume !== "retry-incomplete"
      )
        throw new Error(
          "Incomplete workflow checkpoint: resume retry-incomplete must explicitly authorize replay",
        );
    }
    let writes = Promise.resolve();
    return {
      initial,
      save(state: WorkflowExecutionState) {
        const snapshot: WorkflowCheckpoint = {
          format: 1,
          identity,
          executionId: state.executionId,
          records: [...state.records.values()].map((record) => ({ ...record })),
          values: Object.fromEntries(
            [...state.values].map(([item, value]) => [
              item.key,
              checkpointValue(value),
            ]),
          ),
          usage: state.accounting.snapshot(),
        };
        writes = writes.then(() => lease.write(snapshot));
        return writes;
      },
      async release() {
        await writes.catch(() => {});
        await lease.release();
      },
    };
  } catch (error) {
    await lease.release();
    throw error;
  }
}
