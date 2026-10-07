import { resumeSpeculation } from "./speculation-resume.ts";
import { encodeSpeculation } from "./speculation-checkpoint.ts";
import { checkSpeculationIntegration } from "./speculation-integration.ts";
import { speculationTimeout } from "./speculation-timeout.ts";
import type { SpeculationCheckpoint } from "./speculation-checkpoint.types.ts";
import type { SpeculationStoreSession } from "../infrastructure/speculation-store.types.ts";
import { git } from "../infrastructure/git/command.ts";
import { taskObservation } from "./task-observation.ts";
import { invariant, recoveryDetails } from "../domain/errors.ts";
import { quotaFault } from "../domain/quota.ts";
import type { QuotaFault } from "../domain/quota.types.ts";
import type { ObservationHub } from "../domain/observation.types.ts";
import { workflowAccounting } from "../domain/workflow/budget.ts";
import { speculativeHostSnapshot } from "./speculation-host.ts";
import type { Sandbox } from "./outpost.types.ts";
import { createSandbox } from "./sandbox.ts";
import type {
  SpeculationOptions,
  SpeculationResult,
  SpeculativeCandidateResult,
  SpeculativeOutput,
} from "./speculation.types.ts";
import { taskUsage } from "./task-usage.ts";

export async function runSpeculation<T>(
  options: SpeculationOptions<T>,
  state: SpeculationCheckpoint<T>,
  session: SpeculationStoreSession | undefined,
  concurrency: number,
  cleanupMs: number,
): Promise<SpeculationResult<T>> {
  const { candidates } = options;
  const best = options.select === "best";
  const stop = new AbortController();
  const signal = options.signal
    ? AbortSignal.any([options.signal, stop.signal])
    : stop.signal;
  let budgetError: unknown;
  let sealed = false;
  const accounting = workflowAccounting(
    options.budget,
    (error) => {
      budgetError = error;
      // Attempt limits stop admissions; already admitted candidates may finish.
      if (error.dimension !== "attempts") stop.abort(error);
    },
    state.usage,
  );
  const before = state.before;
  const baseline = before.head;
  const id = state.id;
  const save = async () => {
    if (sealed) return;
    state.usage = accounting.snapshot();
    try {
      await session?.save(encodeSpeculation(state));
    } catch (error) {
      stop.abort(error);
      throw error;
    }
  };
  const latest = await resumeSpeculation(
    options,
    state,
    accounting,
    save,
    cleanupMs,
  );
  const records: SpeculativeCandidateResult<T>[] = candidates.map(
    (candidate) => {
      const attempt = latest.get(candidate.key)!;
      return (
        attempt.record ?? {
          key: candidate.key,
          branch: attempt.branch,
          attempt: attempt.attempt,
          status: "skipped",
        }
      );
    },
  );
  let winner = records.find((record) => record.status === "winner");
  const observations = new Map<string, ObservationHub>();
  await save();
  let next = 0;
  async function worker(): Promise<void> {
    while (!signal.aborted && !winner && !accounting.exhausted) {
      const index = next++;
      const candidate = candidates[index];
      if (!candidate) return;
      const attempt = latest.get(candidate.key)!;
      if (attempt.phase === "settled" || state.finished) continue;
      try {
        accounting.admit();
        attempt.phase = "running";
        attempt.cleanup = "pending";
        await save();
      } catch (error) {
        if (!accounting.exhausted) throw error;
        return;
      }
      const observation = taskObservation(
        options.observation ?? candidate.request.observation,
        candidate.request.observe,
        { candidate: candidate.key },
      );
      if (best) observations.set(candidate.key, observation);
      const initial = records[index]!;
      let sandbox: Sandbox | undefined;
      let result: SpeculativeOutput<T> | undefined;
      let error: unknown;
      let accepted = false;
      let score: number | undefined;
      let cleanupFailed = false;
      let retainedDirectory: string | undefined;
      const usage = taskUsage(
        {
          reportUsage: (value) => {
            if (sealed) return;
            accounting.report(value);
            void save().catch((error) => stop.abort(error));
          },
        },
        undefined,
      );
      try {
        sandbox = await createSandbox({
          ...options.sandbox,
          ...(observation ? { observation } : {}),
          repository: options.repository,
          sandboxProvider: {
            ...options.sandboxProvider,
            async acquire(context) {
              attempt.directory = context.directory;
              await save();
              const lease = await options.sandboxProvider.acquire({
                ...context,
                ...(session
                  ? {
                      async registerRecovery(resourceId: string) {
                        invariant(
                          !sealed && !signal.aborted,
                          "Speculation allocation cancelled",
                        );
                        invariant(
                          resourceId.length > 0 && resourceId.length <= 1024,
                          "Invalid speculation resource identity",
                        );
                        invariant(
                          !attempt.resourceId,
                          "Provider registered more than one speculation resource",
                        );
                        attempt.resourceId = resourceId;
                        await save();
                        signal.throwIfAborted();
                      },
                    }
                  : {}),
              });
              if (session && !attempt.resourceId) {
                await lease.release();
                throw new Error(
                  "Durable provider did not register its resource before allocation",
                );
              }
              return lease;
            },
          },
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
          ...(options.budget.prices ? { prices: options.budget.prices } : {}),
          ...(observation ? { observation } : {}),
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
        observation?.emit("workflow", {
          kind: "candidate",
          status: "validated",
        });
        signal.throwIfAborted();
        if (accepted && best) {
          score = await options.score!({
            key: candidate.key,
            result,
            sandbox,
            signal,
          });
          invariant(
            typeof score === "number" && Number.isFinite(score),
            "Speculation score must be a finite number",
          );
          signal.throwIfAborted();
        }
        const commit = (
          await git(sandbox.workspace.directory, ["rev-parse", "HEAD"])
        ).trim();
        signal.throwIfAborted();
        attempt.accepted = accepted;
        attempt.phase = "validated";
        attempt.record = {
          ...initial,
          status: "rejected",
          result,
          ...(score !== undefined ? { score } : {}),
          directory: sandbox.workspace.directory,
          commit,
        };
        await save();
      } catch (cause) {
        error = cause;
      }
      if (sandbox) {
        try {
          const disposal = await speculationTimeout(
            sandbox.close({
              preserve: !!session || error !== undefined,
            }),
            cleanupMs,
          );
          if (!sealed) attempt.cleanup = "done";
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
      if (sealed) return;
      if (!sandbox && !attempt.resourceId) attempt.cleanup = "done";
      const recovery = recoveryDetails(error);
      const recoveredDirectory =
        typeof recovery?.directory === "string"
          ? recovery.directory
          : undefined;
      const directory = sandbox?.workspace.directory ?? recoveredDirectory;
      retainedDirectory ??= recoveredDirectory;
      const fault = quotaFault(error);
      const quota: QuotaFault | undefined = fault && {
        message: fault.message,
        ...(fault.resetAt ? { resetAt: fault.resetAt } : {}),
      };
      function candidateStatus(): SpeculativeCandidateResult<T>["status"] {
        if (cleanupFailed) return "failed";
        if (signal.aborted) return "cancelled";
        if (error !== undefined) return quota ? "quota" : "failed";
        if (accepted && !winner && !best) return "winner";
        return "rejected";
      }
      observation?.emit("workflow", { kind: "candidate", status: "cleanup" });
      const status = candidateStatus();
      if (!best)
        observation.emit("workflow", {
          kind: "candidate",
          status: status === "winner" ? "accepted" : "rejected",
        });
      const record: SpeculativeCandidateResult<T> = {
        ...initial,
        status,
        ...(attempt.record?.score !== undefined
          ? { score: attempt.record.score }
          : {}),
        ...(attempt.record?.commit ? { commit: attempt.record.commit } : {}),
        cleanup: attempt.cleanup,
        ...(attempt.resourceId ? { resourceId: attempt.resourceId } : {}),
        ...(directory ? { directory } : {}),
        ...(retainedDirectory ? { retainedDirectory } : {}),
        ...(result ? { result } : {}),
        ...(error !== undefined ? { error } : {}),
        ...(status === "quota" ? { quota: quota! } : {}),
      };
      records[index] = record;
      attempt.record = record;
      attempt.phase = "settled";
      if (status === "winner") {
        winner = record;
        stop.abort(
          new Error(`Speculative candidate ${candidate.key} selected`),
        );
      }
      await save();
      if (!best) await observation.close();
    }
  }
  const workers = Promise.all(
    Array.from({ length: Math.min(concurrency, candidates.length) }, worker),
  );
  let removeAbort = () => {};
  const cancelled = new Promise<void>((resolve) => {
    if (signal.aborted) return resolve();
    const listener = () => resolve();
    signal.addEventListener("abort", listener, { once: true });
    removeAbort = () => signal.removeEventListener("abort", listener);
  });
  try {
    await Promise.race([workers, cancelled]);
    await speculationTimeout(workers, cleanupMs);
  } catch (error) {
    stop.abort(error);
    for (const attempt of latest.values()) {
      if (attempt.phase === "settled" || attempt.phase === "waiting") continue;
      const index = candidates.findIndex(
        (candidate) => candidate.key === attempt.key,
      );
      const record: SpeculativeCandidateResult<T> = {
        ...(attempt.record ?? records[index]!),
        status: "cancelled",
        cleanup: "pending",
        error,
        ...(attempt.resourceId ? { resourceId: attempt.resourceId } : {}),
        ...(attempt.directory
          ? {
              directory: attempt.directory,
              retainedDirectory: attempt.directory,
            }
          : {}),
      };
      records[index] = record;
      attempt.record = record;
    }
  } finally {
    removeAbort();
  }
  sealed = true;
  if (best && !winner && !signal.aborted && !state.finished) {
    let winnerIndex = -1;
    for (const [index, record] of records.entries()) {
      if (
        record.status !== "rejected" ||
        record.cleanup !== "done" ||
        record.score === undefined ||
        !latest.get(record.key)?.accepted
      )
        continue;
      if (!winner || record.score > winner.score!) {
        winner = record;
        winnerIndex = index;
      }
    }
    if (winner) {
      winner = { ...winner, status: "winner" };
      records[winnerIndex] = winner;
      latest.get(winner.key)!.record = winner;
    }
  }
  for (const record of records) {
    const observation = observations.get(record.key);
    if (!observation) continue;
    observation.emit("workflow", {
      kind: "candidate",
      status: record.status === "winner" ? "accepted" : "rejected",
    });
    await observation.close();
  }
  function outcome(): SpeculationResult<T>["status"] {
    if (winner) return "winner";
    if (options.signal?.aborted) return "aborted";
    if (budgetError !== undefined) return "budget-exhausted";
    if (records.some((record) => record.status === "quota")) return "quota";
    return "no-winner";
  }
  const status = state.finished && state.status ? state.status : outcome();
  const host = await speculativeHostSnapshot(options.repository).then(
    (after) => ({
      before,
      after,
      changed:
        before.head !== after.head ||
        before.dirty !== after.dirty ||
        before.fingerprint !== after.fingerprint ||
        before.branch !== after.branch,
    }),
    (error: unknown) => ({ before, changed: true, error }),
  );
  state.finished = state.attempts.every(
    (attempt) => attempt.phase === "waiting" || attempt.phase === "settled",
  );
  state.status = status;
  if (budgetError !== undefined) state.error = String(budgetError);
  state.usage = accounting.snapshot();
  await session?.save(encodeSpeculation(state));
  const integration = winner
    ? await checkSpeculationIntegration(
        options.repository,
        winner.branch,
        winner.commit,
      )
    : undefined;
  await options.observation?.flush();
  return {
    id,
    baseline,
    host,
    status,
    candidates: records,
    ...(integration ? { integration } : {}),
    ...(session
      ? {
          previousAttempts: state.attempts
            .filter((attempt) => latest.get(attempt.key) !== attempt)
            .flatMap((attempt) => (attempt.record ? [attempt.record] : [])),
        }
      : {}),
    usage: accounting.snapshot(),
    ...(status === "quota" ? { quota: earliestQuota(records) } : {}),
    ...(winner ? { winner } : {}),
    ...(budgetError !== undefined || state.error
      ? { error: budgetError ?? state.error }
      : {}),
  };
}

function earliestQuota(
  records: readonly SpeculativeCandidateResult<unknown>[],
): QuotaFault {
  const faults = records.flatMap((record) =>
    record.status === "quota" && record.quota ? [record.quota] : [],
  );
  const known = faults
    .filter((fault) => fault.resetAt !== undefined)
    .sort((a, b) => Date.parse(a.resetAt!) - Date.parse(b.resetAt!));
  return known[0] ?? faults[0]!;
}
