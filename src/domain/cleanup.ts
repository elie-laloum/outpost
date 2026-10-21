import type { CleanupPolicy, CleanupStep } from "./cleanup.types.ts";
import { recordRecovery } from "./errors.ts";

/** Attempts every step in order; throws only failures not retained on a prior failure. */
export async function runCleanup(
  steps: readonly CleanupStep[],
  priorFailures: readonly unknown[] = [],
  policy: CleanupPolicy = {},
): Promise<void> {
  const failures: unknown[] = [];
  for (const step of steps) {
    try {
      await step();
    } catch (error) {
      failures.push(error);
    }
  }
  if (!failures.length) return;
  const message = policy.message ?? "Execution and cleanup failed";
  if (priorFailures.length && policy.recovery) {
    recordRecovery(priorFailures[0], {
      [policy.recovery]:
        failures.length === 1 ? failures[0] : new AggregateError(failures),
    });
    return;
  }
  if (!priorFailures.length && failures.length === 1) throw failures[0];
  const errors = [...priorFailures, ...failures];
  throw new AggregateError(errors, message, { cause: errors[0] });
}

/** Runs an action, then its cleanup steps in order, without letting cleanup mask its failure. */
export async function withCleanup<T>(
  action: () => Promise<T>,
  steps: readonly CleanupStep[],
  policy: CleanupPolicy = {},
): Promise<T> {
  let value: T;
  try {
    value = await action();
  } catch (error) {
    await runCleanup(steps, [error], policy);
    throw error;
  }
  await runCleanup(steps, [], policy);
  return value;
}
