import { runStatuses } from "./run.constants.ts";
import { addUsage } from "./usage.ts";
import type { Observation } from "./observation.types.ts";
import type { RunSnapshot, RunDispatch, RunTask } from "./run.types.ts";

export function emptyRunUsage() {
  return { input: 0, cached: 0, output: 0 };
}
export function projectRun(
  current: RunSnapshot,
  observation: Observation,
): RunSnapshot {
  const { event, scope, at } = observation;
  const next = {
    ...current,
    seq: current.seq + 1,
    observationSeq: observation.seq,
    complete:
      current.complete && observation.seq === current.observationSeq + 1,
    updatedAt: at,
  };
  if (event.kind === "workflow") {
    const notification = event.event;
    if (next.kind !== "workflow")
      throw new Error("Workflow event sent to a dispatch projection");
    if (next.executionId && next.executionId !== notification.executionId)
      throw new Error("Run observer received a different workflow execution");
    next.executionId = notification.executionId;
    next.workflow = notification.workflow;
    if (notification.accounting) {
      next.accounting = notification.accounting;
      next.usage = notification.accounting.tokens;
    }
    if (notification.tasks)
      next.tasks = notification.tasks.map((record): RunTask => ({
        key: record.key,
        status: record.status,
        attempts: record.attempts,
        usage: next.tasks.find((task) => task.key === record.key)?.usage ?? {
          ...emptyRunUsage(),
          ...(record.attempts > 0 ? { complete: false } : {}),
        },
        ...(record.startedAt ? { startedAt: record.startedAt } : {}),
        ...(record.finishedAt ? { finishedAt: record.finishedAt } : {}),
        ...(record.error ? { error: record.error } : {}),
      }));
    if (notification.key)
      next.tasks = next.tasks.map((task) => {
        if (task.key !== notification.key) return task;
        const updated = {
          ...task,
          ...(notification.status ? { status: notification.status } : {}),
          ...(notification.type === "task" && notification.status === "active"
            ? { startedAt: at }
            : {}),
          ...(notification.type === "task" && notification.status !== "active"
            ? { finishedAt: at }
            : {}),
          ...(notification.attempt === undefined
            ? {}
            : { attempts: Math.max(task.attempts, notification.attempt) }),
          ...(notification.type === "usage" && notification.usage
            ? { usage: addUsage(task.usage, notification.usage) }
            : {}),
          ...(notification.error ? { error: notification.error } : {}),
        };
        if (notification.type === "task" && notification.status === "active") {
          delete updated.error;
          delete updated.finishedAt;
        }
        return updated;
      });
    if (notification.type === "finish")
      next.status =
        runStatuses.find((status) => status === notification.status) ??
        "failed";
    if (notification.error) {
      const error = {
        message: notification.error,
        ...(notification.terminationCode
          ? { code: notification.terminationCode }
          : {}),
      };
      if (
        !next.errors.some(
          (previous) =>
            previous.message === error.message && previous.code === error.code,
        )
      )
        next.errors = [...next.errors, error];
    }
    return next;
  }
  if (!scope.dispatchId) return next;
  if (
    next.kind === "dispatch" &&
    next.dispatches.some((dispatch) => dispatch.id !== scope.dispatchId)
  )
    throw new Error("Run observer received a different dispatch");
  if (
    next.executionId &&
    scope.executionId &&
    next.executionId !== scope.executionId
  )
    throw new Error("Run observer received a different workflow execution");
  const previous = next.dispatches.find(
    (dispatch) => dispatch.id === scope.dispatchId,
  );
  const dispatch: RunDispatch = previous ?? {
    id: scope.dispatchId,
    status: "running",
    commits: [],
    usage: emptyRunUsage(),
    passes: [],
    ...(scope.taskKey ? { taskKey: scope.taskKey } : {}),
    ...(scope.attempt === undefined ? {} : { attempt: scope.attempt }),
  };
  const changed = { ...dispatch };
  if (!scope.subagentId) {
    if (event.kind === "phase") {
      changed.phase = event.name;
      if (event.agent) changed.agent = event.agent;
      if (event.branch) changed.branch = event.branch;
    }
    if (event.kind === "fallback") changed.agent = event.to.name;
    if (event.kind === "usage" || event.kind === "summary") {
      const pass = scope.pass ?? 1;
      const before =
        changed.passes.find((entry) => entry.pass === pass)?.usage ??
        emptyRunUsage();
      const usage =
        event.kind === "summary" || event.cumulative
          ? event.tokens
          : addUsage(before, event.tokens);
      changed.passes = [
        ...changed.passes.filter((entry) => entry.pass !== pass),
        { pass, usage },
      ];
      changed.usage = changed.passes.reduce(
        (total, entry) => addUsage(total, entry.usage),
        emptyRunUsage(),
      );
    }
  }
  if (event.kind === "dispatch-finished") {
    changed.status = event.status;
    changed.completed = event.completed;
    changed.usage = event.usage;
    changed.commits = event.commits ?? [];
    if (event.branch) changed.branch = event.branch;
    if (event.error) {
      changed.error = event.error;
      next.errors = [...next.errors, event.error];
    }
    if (next.kind === "dispatch") next.status = event.status;
  }
  next.dispatches = [
    ...next.dispatches.filter((entry) => entry.id !== changed.id),
    changed,
  ];
  next.commits = [
    ...new Map(
      next.dispatches
        .flatMap((entry) => entry.commits)
        .map((commit) => [commit.oid, commit]),
    ).values(),
  ];
  if (next.kind === "dispatch") next.usage = changed.usage;
  return next;
}
