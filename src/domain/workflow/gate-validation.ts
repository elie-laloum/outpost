import { gateActions } from "./gates.constants.ts";
import type { Task } from "../workflow.types.ts";
import type { WorkflowGate } from "./gates.types.ts";

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function validateGate(gate: WorkflowGate): void {
  if (!["approval", "pause"].includes(gate.kind))
    throw new Error("Invalid workflow gate kind");
  if (!gate.prompt.trim()) throw new Error("Gate prompt cannot be empty");
  if (
    !gate.actors.length ||
    gate.actors.some((actor) => !actor.trim()) ||
    new Set(gate.actors).size !== gate.actors.length
  )
    throw new Error("Gate actors must be nonempty and unique");
}

export function validateGateRecord(
  record: Record<string, unknown>,
  item: Task,
  executionId: string,
  output: unknown,
): void {
  const invalid = () => new Error("Invalid workflow checkpoint gate record");
  const gate = item.gate;
  const request = record.pause;
  const decision = record.decision;
  if (!gate) {
    if (
      request !== undefined ||
      decision !== undefined ||
      ["paused", "rejected"].includes(String(record.status))
    )
      throw invalid();
    return;
  }
  if (record.attempts !== 0) throw invalid();
  if (!["paused", "done", "rejected"].includes(String(record.status))) {
    if (
      !["waiting", "skipped", "cancelled"].includes(String(record.status)) ||
      request !== undefined ||
      decision !== undefined
    )
      throw invalid();
    return;
  }
  if (
    !object(request) ||
    typeof request.id !== "string" ||
    !request.id.trim() ||
    typeof request.requestedAt !== "string" ||
    !Number.isFinite(Date.parse(request.requestedAt)) ||
    request.kind !== gate.kind ||
    request.prompt !== gate.prompt ||
    JSON.stringify(request.actors) !== JSON.stringify(gate.actors)
  )
    throw invalid();
  if (record.status === "paused") {
    if (decision !== undefined) throw invalid();
    return;
  }
  const action =
    record.status === "rejected" ? "reject" : gateActions[gate.kind];
  if (
    !object(decision) ||
    decision.executionId !== executionId ||
    decision.key !== item.key ||
    decision.requestId !== request.id ||
    decision.action !== action ||
    typeof decision.actor !== "string" ||
    !gate.actors.includes(decision.actor) ||
    typeof decision.reason !== "string" ||
    !decision.reason.trim() ||
    typeof decision.decidedAt !== "string" ||
    !Number.isFinite(Date.parse(decision.decidedAt))
  )
    throw invalid();
  if (
    record.status === "done" &&
    (!object(output) ||
      output.kind !== "json" ||
      !object(output.value) ||
      Object.keys(output.value).length !== Object.keys(decision).length ||
      !Object.entries(decision).every(
        ([key, value]) => object(output.value) && output.value[key] === value,
      ))
  )
    throw invalid();
}
