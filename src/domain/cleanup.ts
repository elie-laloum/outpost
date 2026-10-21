export async function runCleanup(
  steps: readonly (() => unknown | Promise<unknown>)[],
  priorFailures: readonly unknown[] = [],
  message = "Execution and cleanup failed",
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
  if (!priorFailures.length && failures.length === 1) throw failures[0];
  const errors = [...priorFailures, ...failures];
  throw new AggregateError(errors, message, { cause: errors[0] });
}
