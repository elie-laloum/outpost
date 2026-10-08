import { validateSpeculationOptions } from "./speculation-validation.ts";
import { randomUUID } from "node:crypto";
import { openSpeculationStore } from "../infrastructure/speculation-store.ts";
import {
  speculationIdentity,
  validateSpeculation,
} from "./speculation-checkpoint.ts";
import { speculativeHostSnapshot } from "./speculation-host.ts";
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
  const { concurrency, cleanupMs } = validateSpeculationOptions(options);
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
      options.select,
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
