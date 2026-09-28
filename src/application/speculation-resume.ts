import { invariant } from "../domain/errors.ts";
import type { WorkflowAccounting } from "../domain/workflow/budget.types.ts";
import type {
  SpeculationCheckpoint,
  SpeculationAttempt,
} from "./speculation-checkpoint.types.ts";
import type { SpeculationOptions } from "./speculation.types.ts";
import { speculationTimeout } from "./speculation-timeout.ts";

export async function resumeSpeculation<T>(
  options: SpeculationOptions<T>,
  state: SpeculationCheckpoint<T>,
  accounting: WorkflowAccounting,
  save: () => Promise<void>,
  cleanupMs: number,
): Promise<Map<string, SpeculationAttempt<T>>> {
  const latest = new Map(
    state.attempts.map((attempt) => [attempt.key, attempt]),
  );
  if (
    state.attempts.some(
      (attempt) => attempt.phase !== "waiting" && attempt.phase !== "settled",
    ) &&
    options.durability?.resume !== "retry-incomplete"
  )
    throw new Error(
      "Interrupted speculation requires resume retry-incomplete to authorize replay",
    );
  await save();
  for (const attempt of state.attempts) {
    if (attempt.cleanup === "done") continue;
    if (attempt.resourceId) {
      invariant(
        options.sandboxProvider.recover,
        "Sandbox provider cannot recover this resource",
      );
      await save();
      await speculationTimeout(
        options.sandboxProvider.recover(attempt.resourceId, {
          signal: AbortSignal.timeout(cleanupMs),
          deadlineMs: cleanupMs,
        }),
        cleanupMs,
      );
    }
    attempt.cleanup = "done";
    if (attempt.record) attempt.record = { ...attempt.record, cleanup: "done" };
    await save();
  }
  let recoveredWinner = state.attempts.some(
    (attempt) => attempt.record?.status === "winner",
  );
  for (const previous of latest.values()) {
    if (previous.phase === "waiting" || previous.phase === "settled") continue;
    if (previous.phase === "validated" && previous.record) {
      previous.phase = "settled";
      const accepted = previous.accepted && !recoveredWinner;
      previous.record = {
        ...previous.record,
        status: accepted ? "winner" : "rejected",
        cleanup: "done",
        ...(previous.directory
          ? { retainedDirectory: previous.directory }
          : {}),
      };
      recoveredWinner ||= !!accepted;
      continue;
    }
    accounting.report({ input: 0, cached: 0, output: 0, complete: false });
    previous.phase = "settled";
    previous.record = {
      key: previous.key,
      branch: previous.branch,
      attempt: previous.attempt,
      status: "cancelled",
      cleanup: "done",
      ...(previous.directory
        ? {
            directory: previous.directory,
            retainedDirectory: previous.directory,
          }
        : {}),
      error: "Interrupted by coordinator failure",
    };
    const attempt: SpeculationAttempt<T> = {
      key: previous.key,
      attempt: previous.attempt + 1,
      branch: `outpost/speculation/${state.id}/${previous.key}/${previous.attempt + 1}`,
      phase: "waiting",
      cleanup: "done",
    };
    state.attempts.push(attempt);
    latest.set(attempt.key, attempt);
  }
  return latest;
}
