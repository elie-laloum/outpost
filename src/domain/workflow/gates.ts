import { randomUUID } from "node:crypto";
import type { Task, WorkflowExecutionState } from "../workflow.types.ts";
import type {
  WorkflowDecisionRecord,
  WorkflowGate,
  WorkflowGateOptions,
} from "./gates.types.ts";
import { task } from "./task.ts";
import { gateActions } from "./gates.constants.ts";
import { validateGate } from "./gate-validation.ts";

function gateTask(
  kind: WorkflowGate["kind"],
  options: WorkflowGateOptions,
): Task<WorkflowDecisionRecord> {
  validateGate({
    kind,
    prompt: options.prompt,
    actors: options.actors,
    ...(options.authentication !== undefined
      ? { authentication: options.authentication }
      : {}),
  });
  return task({
    key: options.key,
    after: options.after ?? [],
    gate: Object.freeze({
      ...(options.authentication !== undefined
        ? { authentication: options.authentication }
        : {}),
      kind,
      prompt: options.prompt,
      actors: Object.freeze([...options.actors]),
    }),
    perform() {
      throw new Error("Workflow gates must be scheduled with a checkpoint");
    },
  });
}

export function approvalTask(
  options: WorkflowGateOptions,
): Task<WorkflowDecisionRecord> {
  return gateTask("approval", options);
}

export function pauseTask(
  options: WorkflowGateOptions,
): Task<WorkflowDecisionRecord> {
  return gateTask("pause", options);
}

export async function pauseGate(
  item: Task,
  runtime: WorkflowExecutionState,
): Promise<void> {
  const gate = item.gate!;
  runtime.record(item).pause = Object.freeze({
    ...gate,
    id: randomUUID(),
    requestedAt: new Date().toISOString(),
  });
  runtime.emit({ type: "gate", key: item.key, status: "paused" });
  runtime.finish(item, "paused");
  await runtime.persist();
}

export async function prepareDecisions(
  runtime: WorkflowExecutionState,
): Promise<readonly WorkflowDecisionRecord[]> {
  const inputs = (runtime.options.decisions ?? []).map((decision) =>
    Object.freeze({
      ...decision,
      ...(decision.proof
        ? { proof: Object.freeze({ ...decision.proof }) }
        : {}),
    }),
  );
  const decisions = inputs.map((decision) =>
    Object.freeze({
      executionId: decision.executionId,
      key: decision.key,
      requestId: decision.requestId,
      action: decision.action,
      actor: decision.actor,
      reason: decision.reason,
      decidedAt: new Date().toISOString(),
    }),
  );
  const pending = new Map(
    [...runtime.records.keys()].map((item) => [item.key, item]),
  );
  const seen = new Set<string>();
  for (const decision of decisions) {
    const item = pending.get(decision.key);
    const record = item && runtime.record(item);
    const request = record?.pause;
    if (
      !record ||
      !request ||
      record.status !== "paused" ||
      record.decision ||
      decision.executionId !== runtime.executionId ||
      decision.requestId !== request.id ||
      seen.has(decision.key) ||
      typeof decision.actor !== "string" ||
      !request.actors.includes(decision.actor) ||
      typeof decision.reason !== "string" ||
      !decision.reason.trim() ||
      ![gateActions[request.kind], "reject"].includes(decision.action)
    )
      throw new Error(
        `Invalid or unauthorized workflow decision: ${decision.key}`,
      );
    seen.add(decision.key);
  }
  const verified: WorkflowDecisionRecord[] = [];
  for (const [index, decision] of decisions.entries()) {
    const input = inputs[index]!;
    const signed = pending.get(decision.key)!.gate!.authentication === "signed";
    if (!signed && !input.proof) {
      verified.push(decision);
      continue;
    }
    if (!input.proof || !runtime.options.decisionVerifier)
      throw new Error(`Signed workflow decision required: ${decision.key}`);
    const verification = await runtime.options.decisionVerifier(input);
    if (
      !verification ||
      typeof verification.keyId !== "string" ||
      !verification.keyId.trim() ||
      verification.keyId !== input.proof.keyId ||
      typeof verification.verifiedAt !== "string" ||
      !Number.isFinite(Date.parse(verification.verifiedAt))
    )
      throw new Error("Invalid workflow decision verification");
    verified.push(
      Object.freeze({
        ...decision,
        verification: Object.freeze({
          keyId: verification.keyId,
          verifiedAt: verification.verifiedAt,
        }),
      }),
    );
  }
  return verified;
}

export function applyDecisions(
  runtime: WorkflowExecutionState,
  decisions: readonly WorkflowDecisionRecord[],
): void {
  const pending = new Map(
    [...runtime.records.keys()].map((item) => [item.key, item]),
  );
  for (const decision of decisions) {
    const item = pending.get(decision.key)!;
    const record = runtime.record(item);
    record.decision = decision;
    runtime.emit({
      type: "decision",
      key: item.key,
      status: decision.action === "reject" ? "rejected" : "done",
    });
    if (decision.action === "reject") {
      record.error = `${item.key} rejected by ${decision.actor}: ${decision.reason}`;
      runtime.errors.push(new Error(record.error));
      runtime.finish(item, "rejected");
      continue;
    }
    runtime.values.set(item, decision);
    runtime.finish(item, "done");
  }
}
