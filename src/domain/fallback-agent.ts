import type { Agent } from "./agent.types.ts";
import { invariant } from "./errors.ts";
import {
  fallbackAgentKinds,
  fallbackTriggers,
} from "./fallback-agent.constants.ts";
import type {
  DispatchAgent,
  FallbackAgent,
  FallbackAgentOptions,
  FallbackCandidate,
  FallbackFailure,
  FallbackTrigger,
} from "./fallback-agent.types.ts";
import { quotaFault } from "./quota.ts";
import { unavailableFault } from "./unavailable.ts";

export function fallbackAgent(
  agents: readonly [Agent, Agent, ...Agent[]],
  options: FallbackAgentOptions,
): FallbackAgent {
  invariant(
    Array.isArray(agents) && agents.length >= 2,
    "Fallback agents require at least two candidates",
  );
  invariant(
    agents.every(
      (candidate) =>
        candidate &&
        typeof candidate === "object" &&
        fallbackAgentKinds.has(candidate.kind),
    ),
    "Fallback candidates must be agents created with agent() or replayAgent()",
  );
  invariant(
    options && Array.isArray(options.on) && options.on.length > 0,
    'Fallback agents require an explicit "on" list',
  );
  invariant(
    options.on.every((trigger) => fallbackTriggers.has(trigger)),
    `Fallback triggers must be ${[...fallbackTriggers].join(" or ")}`,
  );
  invariant(
    new Set(options.on).size === options.on.length,
    "Fallback triggers must not repeat",
  );
  return Object.freeze({
    kind: "fallback",
    agents: Object.freeze([...agents]),
    on: Object.freeze([...options.on]),
  });
}

export function dispatchCandidates(agent: DispatchAgent): readonly Agent[] {
  return agent.kind === "fallback" ? agent.agents : [agent];
}

export function fallbackCandidate(
  agent: Agent,
  index: number,
): FallbackCandidate {
  const model = "model" in agent ? agent.model?.name : undefined;
  return Object.freeze({
    index,
    name: agent.name,
    ...(model ? { model } : {}),
  });
}

/** Failure category of an error when the fallback policy covers it. */
export function fallbackFailure(
  error: unknown,
  on: readonly FallbackTrigger[],
): FallbackFailure | undefined {
  const quota = quotaFault(error);
  if (quota)
    return on.includes("quota")
      ? {
          failure: "quota",
          message: quota.message,
          ...(quota.resetAt ? { resetAt: quota.resetAt } : {}),
        }
      : undefined;
  const outage = unavailableFault(error);
  if (!outage || !on.includes("unavailable")) return undefined;
  return { failure: "unavailable", message: outage.message };
}
