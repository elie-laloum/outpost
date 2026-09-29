import type { AgentObservation, Usage } from "../domain/agent.types.ts";
import {
  OutpostError,
  recordRecovery,
  recoveryDetails,
} from "../domain/errors.ts";
import {
  fallbackCandidate,
  fallbackFailure,
} from "../domain/fallback-agent.ts";
import type {
  DispatchAgent,
  FallbackAttempt,
} from "../domain/fallback-agent.types.ts";
import { quotaFault } from "../domain/quota.ts";
import { addUsage } from "../domain/usage.ts";
import type {
  CandidateRunner,
  FallbackOutcome,
} from "./agent-fallback.types.ts";
import { notify } from "./observation.ts";

const noUsage = (): Usage => ({ input: 0, cached: 0, output: 0 });

/** Runs the requested agent, trying fallback candidates in order on covered failures. */
export async function runWithFallback<R>(
  requested: DispatchAgent,
  observe: ((event: AgentObservation) => void) | undefined,
  signal: AbortSignal,
  run: CandidateRunner<R>,
): Promise<FallbackOutcome<R>> {
  if (requested.kind !== "fallback")
    return {
      value: await run(requested, (event) => notify(observe, event)),
      failedUsage: noUsage(),
    };
  const attempts: FallbackAttempt[] = [];
  let failedUsage = noUsage();
  let offset = 0;
  for (const [index, agent] of requested.agents.entries()) {
    const usage = passUsage();
    let passes = 0;
    try {
      const value = await run(agent, (event) => {
        passes = Math.max(passes, event.pass);
        usage.observe(event);
        notify(observe, { ...event, pass: event.pass + offset });
      });
      return {
        value,
        failedUsage,
        fallback: Object.freeze({
          selected: fallbackCandidate(agent, index),
          attempts: Object.freeze([...attempts]),
        }),
      };
    } catch (error) {
      failedUsage = addUsage(failedUsage, usage.total());
      const covered = signal.aborted
        ? undefined
        : fallbackFailure(error, requested.on);
      if (covered)
        attempts.push(
          Object.freeze({ ...fallbackCandidate(agent, index), ...covered }),
        );
      const next = requested.agents[index + 1];
      if (!covered || !next) throw exhausted(error, attempts, !!covered);
      offset += Math.max(passes, 1);
      notify(observe, {
        kind: "fallback",
        from: fallbackCandidate(agent, index),
        to: fallbackCandidate(next, index + 1),
        ...covered,
        pass: offset,
        at: new Date().toISOString(),
      });
    }
  }
  throw new OutpostError("configuration", "Fallback agent has no candidates");
}

/** Rethrows the last failure, summarizing resets when every candidate hit a limit. */
function exhausted(
  error: unknown,
  attempts: readonly FallbackAttempt[],
  covered: boolean,
): unknown {
  recordRecovery(error, { fallback: attempts });
  const quota = quotaFault(error);
  if (
    !covered ||
    !quota ||
    attempts.length < 2 ||
    attempts.some((attempt) => attempt.failure !== "quota")
  )
    return error;
  const resets = attempts.map((attempt) => attempt.resetAt);
  const resetAt = resets.every((reset) => reset !== undefined)
    ? new Date(
        Math.min(...resets.map((reset) => Date.parse(reset!))),
      ).toISOString()
    : undefined;
  const summary = new OutpostError(
    "quota",
    `Every fallback candidate reached a usage or rate limit: ${quota.message}`,
    { fallback: attempts, ...(resetAt ? { resetAt } : {}) },
    error,
  );
  recordRecovery(summary, recoveryDetails(error) ?? {});
  return summary;
}

/** Sums one candidate's usage from observed per-pass usage and summary events. */
function passUsage() {
  const passes = new Map<number, Usage>();
  return {
    observe(event: AgentObservation): void {
      if (event.kind === "usage")
        passes.set(
          event.pass,
          addUsage(passes.get(event.pass) ?? noUsage(), event.tokens),
        );
      if (event.kind === "summary") passes.set(event.pass, event.tokens);
    },
    total(): Usage {
      return [...passes.values()].reduce(addUsage, noUsage());
    },
  };
}
