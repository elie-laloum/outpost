import { checkpointValue } from "./checkpoint-value.ts";
import { loopDefinition } from "./loop-task.ts";
import type { Task } from "../workflow.types.ts";
import type { LoopCheckResult } from "./loop-task.types.ts";

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateLoopCheck(
  value: unknown,
): asserts value is LoopCheckResult {
  if (
    !object(value) ||
    typeof value.done !== "boolean" ||
    (!value.done && typeof value.feedback !== "string")
  )
    throw new Error(
      "Loop check must return { done: true } or { done: false, feedback: string }",
    );
}

export function validateLoopRecord(
  record: Record<string, unknown>,
  item: Task,
): void {
  const definition = loopDefinition(item);
  const invalid = () =>
    new Error("Invalid or incompatible workflow loop checkpoint");
  if (record.rounds === undefined) {
    if (definition && (record.attempts !== 0 || record.status === "done"))
      throw invalid();
    return;
  }
  if (
    !definition ||
    !Array.isArray(record.rounds) ||
    record.rounds.length === 0 ||
    record.rounds.length > definition.maxRounds ||
    record.rounds.length > Number(record.attempts)
  )
    throw invalid();
  for (const [index, entry] of record.rounds.entries()) {
    if (
      !object(entry) ||
      entry.round !== index + 1 ||
      !["attempt", "check", "complete"].includes(String(entry.phase))
    )
      throw invalid();
    const final = index === record.rounds.length - 1;
    if (!final && entry.phase !== "complete") throw invalid();
    if (entry.phase === "attempt") {
      if (entry.output !== undefined || entry.check !== undefined)
        throw invalid();
      continue;
    }
    if (
      !object(entry.output) ||
      !["undefined", "json"].includes(String(entry.output.kind))
    )
      throw invalid();
    if (entry.output.kind === "json") {
      if (
        !Object.hasOwn(entry.output, "value") ||
        entry.output.value === undefined
      )
        throw invalid();
      checkpointValue(entry.output.value);
    }
    if (entry.phase === "check") {
      if (entry.check !== undefined) throw invalid();
      continue;
    }
    validateLoopCheck(entry.check);
    if (entry.check.done && !final) throw invalid();
  }
  const last: unknown = record.rounds.at(-1);
  if (
    record.status === "done" &&
    (!object(last) || !object(last.check) || last.check.done !== true)
  )
    throw invalid();
}
