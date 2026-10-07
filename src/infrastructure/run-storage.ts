import { positive, invariant } from "../domain/errors.ts";
import { validateUsage } from "../domain/usage.ts";
import { transportKey } from "../domain/transport.ts";
import {
  runDefaults,
  runStatuses,
  runTaskStatuses,
  runDispatchStatuses,
} from "../domain/run.constants.ts";
import type {
  RunSnapshot,
  RunTask,
  RunDispatch,
  RunError,
  RunEvent,
} from "../domain/run.types.ts";
import type { Usage } from "../domain/agent.types.ts";
import type { ObservationScope } from "../domain/observation.types.ts";
import type { Commit } from "../domain/workspace.types.ts";
import type { WorkflowUsage } from "../domain/workflow/budget.types.ts";

export function runPrefix(id: string): string {
  invariant(
    typeof id === "string" && id.length <= 128 && !id.includes("/"),
    "Invalid run ID",
  );
  return transportKey(`runs/${id}`);
}
export function runInterval(value: number, label: string): number {
  positive(value, label);
  invariant(
    value <= 2_147_483_647,
    `${label} exceeds the supported timer range`,
  );
  return value;
}
function object(value: unknown): asserts value is Record<string, unknown> {
  invariant(
    !!value && typeof value === "object" && !Array.isArray(value),
    "Invalid run object",
  );
}
function string(value: unknown): string {
  invariant(typeof value === "string", "Invalid run string");
  return value;
}
function text(value: unknown): string {
  const result = string(value);
  invariant(result.length > 0, "Invalid run text");
  return result;
}
function integer(value: unknown): number {
  invariant(
    typeof value === "number" && Number.isSafeInteger(value) && value >= 0,
    "Invalid run integer",
  );
  return value;
}
function date(value: unknown): string {
  const result = text(value);
  invariant(Number.isFinite(Date.parse(result)), "Invalid run date");
  return result;
}
function boolean(value: unknown): boolean {
  invariant(typeof value === "boolean", "Invalid run boolean");
  return value;
}
function array(value: unknown): unknown[] {
  invariant(Array.isArray(value), "Invalid run array");
  return value;
}
function usage(value: unknown): Usage {
  validateUsage(value);
  return value;
}
function error(value: unknown): RunError {
  object(value);
  return {
    message: string(value.message),
    ...(value.code === undefined ? {} : { code: text(value.code) }),
  };
}
function commits(value: unknown): Commit[] {
  return array(value).map((entry) => {
    object(entry);
    return { oid: text(entry.oid), subject: string(entry.subject) };
  });
}
function task(value: unknown): RunTask {
  object(value);
  const status = runTaskStatuses.find((status) => status === value.status);
  invariant(status, "Invalid run task status");
  return {
    key: text(value.key),
    status,
    attempts: integer(value.attempts),
    usage: usage(value.usage),
    ...(value.startedAt === undefined
      ? {}
      : { startedAt: date(value.startedAt) }),
    ...(value.finishedAt === undefined
      ? {}
      : { finishedAt: date(value.finishedAt) }),
    ...(value.error === undefined ? {} : { error: string(value.error) }),
  };
}
function dispatch(value: unknown): RunDispatch {
  object(value);
  const status = runDispatchStatuses.find((status) => status === value.status);
  invariant(status, "Invalid run dispatch status");
  return {
    id: text(value.id),
    status,
    commits: commits(value.commits),
    usage: usage(value.usage),
    passes: array(value.passes).map((entry) => {
      object(entry);
      return { pass: integer(entry.pass), usage: usage(entry.usage) };
    }),
    ...(value.taskKey === undefined ? {} : { taskKey: text(value.taskKey) }),
    ...(value.attempt === undefined ? {} : { attempt: integer(value.attempt) }),
    ...(value.agent === undefined ? {} : { agent: text(value.agent) }),
    ...(value.phase === undefined ? {} : { phase: string(value.phase) }),
    ...(value.branch === undefined ? {} : { branch: text(value.branch) }),
    ...(value.completed === undefined
      ? {}
      : { completed: boolean(value.completed) }),
    ...(value.error === undefined ? {} : { error: error(value.error) }),
  };
}
function accounting(value: unknown): WorkflowUsage {
  object(value);
  const result = {
    attempts: integer(value.attempts),
    tokens: usage(value.tokens),
  };
  if (value.cost === undefined) return result;
  object(value.cost);
  const cost = value.cost;
  invariant(
    cost.currency === "USD" || cost.currency === "EUR",
    "Invalid run cost currency",
  );
  invariant(
    typeof cost.amount === "number" &&
      Number.isFinite(cost.amount) &&
      cost.amount >= 0,
    "Invalid run cost",
  );
  return {
    ...result,
    cost: {
      currency: cost.currency,
      amount: cost.amount,
      complete: boolean(cost.complete),
    },
  };
}
export function runSnapshot(value: unknown): RunSnapshot {
  object(value);
  invariant(value.version === 1, "Unknown run version");
  invariant(
    value.kind === "dispatch" || value.kind === "workflow",
    "Invalid run kind",
  );
  const status = runStatuses.find((status) => status === value.status);
  invariant(status && status !== "abandoned", "Invalid stored run status");
  const id = text(value.id);
  runPrefix(id);
  return {
    version: 1,
    id,
    kind: value.kind,
    status,
    seq: integer(value.seq),
    observationSeq: integer(value.observationSeq),
    complete: boolean(value.complete),
    startedAt: date(value.startedAt),
    updatedAt: date(value.updatedAt),
    heartbeatAt: date(value.heartbeatAt),
    expiresAt: date(value.expiresAt),
    tasks: array(value.tasks).map(task),
    dispatches: array(value.dispatches).map(dispatch),
    commits: commits(value.commits),
    usage: usage(value.usage),
    errors: array(value.errors).map(error),
    ...(value.executionId === undefined
      ? {}
      : { executionId: text(value.executionId) }),
    ...(value.workflow === undefined ? {} : { workflow: text(value.workflow) }),
    ...(value.accounting === undefined
      ? {}
      : { accounting: accounting(value.accounting) }),
  };
}
export function runEvent(value: unknown): RunEvent {
  object(value);
  object(value.scope);
  invariant(Object.hasOwn(value, "event"), "Missing run event payload");
  const scope: ObservationScope = {
    ...(value.scope.executionId === undefined
      ? {}
      : { executionId: text(value.scope.executionId) }),
    ...(value.scope.dispatchId === undefined
      ? {}
      : { dispatchId: text(value.scope.dispatchId) }),
    ...(value.scope.taskKey === undefined
      ? {}
      : { taskKey: text(value.scope.taskKey) }),
    ...(value.scope.attempt === undefined
      ? {}
      : { attempt: integer(value.scope.attempt) }),
    ...(value.scope.pass === undefined
      ? {}
      : { pass: integer(value.scope.pass) }),
    ...(value.scope.subagentId === undefined
      ? {}
      : { subagentId: text(value.scope.subagentId) }),
    ...(value.scope.candidate === undefined
      ? {}
      : { candidate: text(value.scope.candidate) }),
  };
  const seq = positive(integer(value.seq), "seq");
  const observationSeq = positive(
    integer(value.observationSeq),
    "observationSeq",
  );
  return {
    seq,
    observationSeq,
    at: date(value.at),
    source: text(value.source),
    scope,
    event: value.event,
  };
}
export function runReadLimit(value = runDefaults.maxBytes): number {
  return positive(value, "maxBytes");
}
