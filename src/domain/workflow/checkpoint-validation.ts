import { validateGateRecord } from "./gate-validation.ts";
import type { WorkflowCheckpoint } from "./checkpoint.types.ts";
import type { Task } from "../workflow.types.ts";
import { checkpointValue } from "./checkpoint-value.ts";

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function integer(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

export function validateCheckpoint(
  value: unknown,
  identity: string,
  tasks: readonly Task[],
): asserts value is WorkflowCheckpoint {
  const invalid = () =>
    new Error("Invalid or incompatible workflow checkpoint");
  if (
    !object(value) ||
    value.format !== 1 ||
    value.identity !== identity ||
    typeof value.executionId !== "string" ||
    !value.executionId ||
    !Array.isArray(value.records) ||
    !object(value.values) ||
    !object(value.usage)
  )
    throw invalid();
  if (!integer(value.usage.attempts) || !object(value.usage.tokens))
    throw invalid();
  for (const dimension of ["input", "cached", "output"])
    if (!integer(value.usage.tokens[dimension])) throw invalid();
  for (const count of Object.values(value.usage.tokens))
    if (!integer(count)) throw invalid();
  if (value.records.length !== tasks.length) throw invalid();
  const keys = new Set(tasks.map((item) => item.key));
  let attempts = 0;
  for (const record of value.records) {
    if (
      !object(record) ||
      typeof record.key !== "string" ||
      !keys.delete(record.key) ||
      !integer(record.attempts) ||
      ![
        "waiting",
        "active",
        "done",
        "failed",
        "skipped",
        "cancelled",
        "paused",
        "rejected",
      ].includes(String(record.status))
    )
      throw invalid();
    for (const field of ["startedAt", "finishedAt", "error"])
      if (record[field] !== undefined && typeof record[field] !== "string")
        throw invalid();
    attempts += record.attempts;
    const output = Object.hasOwn(value.values, record.key)
      ? value.values[record.key]
      : undefined;
    validateGateRecord(
      record,
      tasks.find((item) => item.key === record.key)!,
      value.executionId,
      output,
    );
    if (record.status !== "done") {
      if (output !== undefined) throw invalid();
      continue;
    }
    if (!object(output) || !["undefined", "json"].includes(String(output.kind)))
      throw invalid();
    if (output.kind === "json") {
      if (!Object.hasOwn(output, "value") || output.value === undefined)
        throw invalid();
      checkpointValue(output.value);
    }
  }
  if (attempts !== value.usage.attempts) throw invalid();
  if (
    Object.keys(value.values).some(
      (key) => !tasks.some((item) => item.key === key),
    )
  )
    throw invalid();
  const records = new Map(value.records.map((entry) => [entry.key, entry]));
  for (const item of tasks)
    if (
      ["done", "paused", "rejected"].includes(
        String(records.get(item.key)?.status),
      ) &&
      item.after.some(
        (dependency) => records.get(dependency.key)?.status !== "done",
      )
    )
      throw invalid();
}
