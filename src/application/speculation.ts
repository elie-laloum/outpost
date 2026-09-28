import { randomUUID } from "node:crypto";
import { invariant } from "../domain/errors.ts";
import { openSpeculationStore } from "../infrastructure/speculation-store.ts";
import {
  speculationIdentity,
  validateSpeculation,
} from "./speculation-checkpoint.ts";
import { speculativeHostSnapshot } from "./speculation-host.ts";
import { speculationLimits } from "./speculation.constants.ts";
import { runSpeculation } from "./speculation-run.ts";
import type { SpeculationCheckpoint } from "./speculation-checkpoint.types.ts";
import type {
  SpeculationOptions,
  SpeculationResult,
} from "./speculation.types.ts";

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
  const cleanupMs = options.cleanupMs ?? speculationLimits.cleanupMs;
  invariant(
    Number.isSafeInteger(cleanupMs) &&
      cleanupMs > 0 &&
      cleanupMs <= 2_147_483_647,
    "Speculation cleanupMs must be a positive timer duration",
  );
  if (options.durability) {
    invariant(
      !!options.durability.version.trim(),
      "Speculation durability version must not be empty",
    );
    invariant(
      !!options.sandboxProvider.recover,
      "Sandbox provider does not support durable speculation recovery",
    );
  }
  const identity = await speculationIdentity(options);
  const session = options.durability
    ? await openSpeculationStore(
        options.durability.transporter,
        options.durability.runId,
      )
    : undefined;
  let state: SpeculationCheckpoint<T>;
  if (session?.initial !== undefined) {
    validateSpeculation<T>(
      session.initial,
      identity,
      candidates.map((candidate) => candidate.key),
    );
    state = session.initial;
  } else {
    const id = randomUUID();
    state = {
      format: 1,
      identity,
      id,
      before: await speculativeHostSnapshot(options.repository),
      usage: { attempts: 0, tokens: { input: 0, cached: 0, output: 0 } },
      finished: false,
      attempts: candidates.map((candidate) => ({
        key: candidate.key,
        attempt: 1,
        branch: `outpost/speculation/${id}/${candidate.key}${session ? "/1" : ""}`,
        phase: "waiting",
        cleanup: "done",
      })),
    };
  }
  const result = await runSpeculation(
    options,
    state,
    session,
    concurrency,
    cleanupMs,
  );
  if (state.attempts.every((attempt) => attempt.cleanup === "done"))
    await session?.release();
  return result;
}
