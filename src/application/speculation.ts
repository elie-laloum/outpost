import { randomUUID } from "node:crypto";
import { invariant, recoveryDetails } from "../domain/errors.ts";
import { workflowAccounting } from "../domain/workflow/budget.ts";
import { speculativeHostSnapshot } from "./speculation-host.ts";
import type { Sandbox } from "./outpost.types.ts";
import { createSandbox } from "./sandbox.ts";
import { speculationLimits } from "./speculation.constants.ts";
import type {
  SpeculationOptions,
  SpeculationResult,
  SpeculativeCandidateResult,
  SpeculativeOutput,
} from "./speculation.types.ts";
import { taskUsage } from "./task-usage.ts";

export async function speculate<T = undefined>(
  options: SpeculationOptions<T>,
): Promise<SpeculationResult<T>> {
  const { candidates } = options;
  invariant(
    candidates.length > 0 && candidates.length <= speculationLimits.candidates,
    `Speculation requires 1 to ${speculationLimits.candidates} candidates`,
  );
  invariant(
    new Set(candidates.map((candidate) => candidate.key)).size ===
      candidates.length &&
      candidates.every((candidate) =>
        /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(candidate.key),
      ),
    "Speculative candidate keys must be unique simple names of 1 to 64 characters",
  );
  const concurrency = options.concurrency ?? speculationLimits.concurrency;
  invariant(
    Number.isSafeInteger(concurrency) &&
      concurrency > 0 &&
      concurrency <= speculationLimits.candidates,
    `Speculation concurrency must be 1 to ${speculationLimits.candidates}`,
  );
  const stop = new AbortController();
  const signal = options.signal
    ? AbortSignal.any([options.signal, stop.signal])
    : stop.signal;
  let budgetError: unknown;
  const accounting = workflowAccounting(options.budget, (error) => {
    budgetError = error;
    // Attempt limits stop admissions; already admitted candidates may finish.
    if (error.dimension !== "attempts") stop.abort(error);
  });
  const before = await speculativeHostSnapshot(options.repository);
  const baseline = before.head;
  const id = randomUUID();
  const records: SpeculativeCandidateResult<T>[] = candidates.map(
    (candidate) => ({
      key: candidate.key,
      branch: `outpost/speculation/${id}/${candidate.key}`,
      status: "skipped",
    }),
  );
  let winner: SpeculativeCandidateResult<T> | undefined;
  let next = 0;
  async function worker(): Promise<void> {
    while (!signal.aborted && !winner && !accounting.exhausted) {
      const index = next++;
      const candidate = candidates[index];
      if (!candidate) return;
      try {
        accounting.admit();
      } catch {
        return;
      }
      const initial = records[index]!;
      let sandbox: Sandbox | undefined;
      let result: SpeculativeOutput<T> | undefined;
      let error: unknown;
      let accepted = false;
      let cleanupFailed = false;
      let retainedDirectory: string | undefined;
      const usage = taskUsage(
        { reportUsage: (value) => accounting.report(value) },
        candidate.request.observe,
      );
      try {
        sandbox = await createSandbox({
          ...options.sandbox,
          repository: options.repository,
          provider: options.provider,
          branch: { mode: "named", name: initial.branch, from: baseline },
          agent: candidate.agent,
          signal,
        });
        signal.throwIfAborted();
        invariant(
          sandbox.workspace.baseline === baseline,
          "Speculative workspace does not match the pinned baseline",
        );
        const {
          resume: _resume,
          fork: _fork,
          ...output
        } = await sandbox.dispatch({
          ...candidate.request,
          signal,
          observe: usage.observe,
        });
        result = output;
        usage.reconcile(output.usage);
        signal.throwIfAborted();
        accepted = await options.validate({
          key: candidate.key,
          result,
          sandbox,
          signal,
        });
        signal.throwIfAborted();
      } catch (cause) {
        error = cause;
      }
      if (sandbox) {
        try {
          const disposal = await sandbox.close({
            preserve: error !== undefined,
          });
          retainedDirectory = disposal.retainedDirectory;
        } catch (cause) {
          cleanupFailed = true;
          error =
            error === undefined
              ? cause
              : new AggregateError(
                  [error, cause],
                  "Speculative execution and cleanup failed",
                );
          retainedDirectory = sandbox.workspace.directory;
        }
      }
      const recovery = recoveryDetails(error);
      const recoveredDirectory =
        typeof recovery?.directory === "string"
          ? recovery.directory
          : undefined;
      const directory = sandbox?.workspace.directory ?? recoveredDirectory;
      retainedDirectory ??= recoveredDirectory;
      function candidateStatus(): SpeculativeCandidateResult<T>["status"] {
        if (cleanupFailed) return "failed";
        if (signal.aborted) return "cancelled";
        if (error !== undefined) return "failed";
        if (accepted && !winner) return "winner";
        return "rejected";
      }
      const status = candidateStatus();
      const record: SpeculativeCandidateResult<T> = {
        ...initial,
        status,
        ...(directory ? { directory } : {}),
        ...(retainedDirectory ? { retainedDirectory } : {}),
        ...(result ? { result } : {}),
        ...(error !== undefined ? { error } : {}),
      };
      records[index] = record;
      if (status === "winner") {
        winner = record;
        stop.abort(
          new Error(`Speculative candidate ${candidate.key} selected`),
        );
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, candidates.length) }, worker),
  );
  function outcome(): SpeculationResult<T>["status"] {
    if (winner) return "winner";
    if (options.signal?.aborted) return "aborted";
    if (budgetError !== undefined) return "budget-exhausted";
    return "no-winner";
  }
  const status = outcome();
  const host = await speculativeHostSnapshot(options.repository).then(
    (after) => ({
      before,
      after,
      changed:
        before.fingerprint !== after.fingerprint ||
        before.branch !== after.branch,
    }),
    (error: unknown) => ({ before, changed: true, error }),
  );
  return {
    id,
    baseline,
    host,
    status,
    candidates: records,
    usage: accounting.snapshot(),
    ...(winner ? { winner } : {}),
    ...(budgetError !== undefined ? { error: budgetError } : {}),
  };
}
