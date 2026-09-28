import { recoveryDetails } from "../errors.ts";
import { quotaFault } from "../quota.ts";
import { waitForRetry } from "./retry.ts";
import type { Task, WorkflowExecutionState } from "../workflow.types.ts";
import type {
  WorkflowQuotaPause,
  WorkflowQuotaPolicy,
} from "./quota-pause.types.ts";

export function validateQuotaPolicy(policy: WorkflowQuotaPolicy): void {
  if (policy.action !== "pause")
    throw new Error("onQuota.action must be pause");
  const wait = policy.maxWaitMs;
  if (wait !== undefined && (!Number.isSafeInteger(wait) || wait < 0))
    throw new Error("onQuota.maxWaitMs must be a nonnegative safe integer");
}

/** Milliseconds before a paused task may run again, or undefined to stay paused. */
function resumeDelay(
  pause: WorkflowQuotaPause,
  maxWaitMs: number,
  now: number,
): number | undefined {
  if (pause.resetAt === undefined) return 0;
  const delay = Math.max(0, Date.parse(pause.resetAt) - now);
  return delay <= maxWaitMs ? delay : undefined;
}

export function quotaResumes(runtime: WorkflowExecutionState): Set<Task> {
  const maxWaitMs = runtime.options.onQuota?.maxWaitMs ?? 0;
  const now = Date.now();
  const resumes = new Set<Task>();
  for (const [item, record] of runtime.records)
    if (
      record.status === "paused" &&
      record.quota &&
      resumeDelay(record.quota, maxWaitMs, now) !== undefined
    )
      resumes.add(item);
  return resumes;
}

export async function pauseForQuota(
  item: Task,
  runtime: WorkflowExecutionState,
  error: unknown,
): Promise<boolean> {
  const fault = runtime.options.onQuota ? quotaFault(error) : undefined;
  if (!fault || runtime.signal.aborted) return false;
  const state = runtime.record(item);
  const recovery = recoveryDetails(error);
  const captured = typeof recovery?.transcript === "string";
  state.quota = Object.freeze({
    requestedAt: new Date().toISOString(),
    message: fault.message,
    ...(fault.resetAt === undefined ? {} : { resetAt: fault.resetAt }),
    ...(captured && fault.conversation
      ? { conversation: fault.conversation }
      : {}),
    ...(typeof recovery?.branch === "string" && recovery.branch
      ? { branch: recovery.branch }
      : {}),
  });
  runtime.finish(item, "paused");
  await runtime.persist();
  return true;
}

/** Waits for a paused task's reset when allowed; false leaves the task paused. */
export async function awaitQuotaReset(
  item: Task,
  runtime: WorkflowExecutionState,
  resuming: boolean,
): Promise<boolean> {
  const state = runtime.record(item);
  const pause = state.quota!;
  const maxWaitMs = runtime.options.onQuota?.maxWaitMs ?? 0;
  const now = Date.now();
  const future = pause.resetAt !== undefined && Date.parse(pause.resetAt) > now;
  const delay =
    resuming || future ? resumeDelay(pause, maxWaitMs, now) : undefined;
  runtime.emit({
    type: "quota",
    key: item.key,
    attempt: state.attempts,
    status: delay === undefined ? "paused" : "waiting",
    ...(pause.resetAt === undefined ? {} : { resetAt: pause.resetAt }),
    ...(delay ? { delayMs: delay } : {}),
  });
  if (delay === undefined) return false;
  try {
    await waitForRetry(delay, runtime.signal);
  } catch (error) {
    if (runtime.signal.aborted) return false;
    throw error;
  }
  runtime.quotaResumes.set(item, pause);
  delete state.quota;
  return true;
}
