---
title: "Fallback agents"
description: "Hand a dispatch to another agent or model when the first one hits a limit or its service is down."
---

Implemented, not yet released. `fallbackAgent()` takes an ordered list of agents. When a candidate fails for a reason listed in `on`, the next one takes over in the same sandbox and workspace.

```ts
import {
  agent,
  claudeHarness,
  codexHarness,
  createSandbox,
  fallbackAgent,
} from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

const coder = fallbackAgent(
  [
    agent({
      harness: claudeHarness({ authentication: "account" }),
      model: "opus",
    }),
    agent({
      harness: claudeHarness({ authentication: "account" }),
      model: "sonnet",
    }),
    agent({ harness: codexHarness({ authentication: "usage" }) }),
  ],
  { on: ["quota", "unavailable"] },
);

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
});
const result = await sandbox.dispatch({
  brief: { text: "Fix the failing tests." },
});
console.log(result.fallback?.selected, result.fallback?.attempts);
```

A backup model is the same harness with another `model`; a backup agent is another harness. Each candidate keeps its own authentication, so the example can use a Claude subscription first and fall back to the Codex API, which bills usage.

## When the next candidate takes over

`on` is required; list the categories explicitly:

| Category      | Recognized failures                                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `quota`       | A usage or rate limit, as classified for [quota pauses](../quota-pauses/#what-counts-as-a-quota): `OutpostError` code `quota`.                    |
| `unavailable` | A terminal outage reported by a failed turn: overload, HTTP 408/5xx/529, connection or transport failure. Read it with `unavailableFault(error)`. |

Only a failed turn with one of these signals moves on. Everything else is rethrown immediately: cancellation, deadlines, configuration and authentication errors, invalid responses and crashes. Retry notices that a CLI prints while it is still retrying are ignored. An outage keeps its original fault code (`process` or `provider`); `unavailableFault()` reads the marker through wrapped causes.

## What the next candidate sees

- **Same workspace.** Files and commits left by the failed candidate stay in place. Nothing is reset or discarded.
- **Original brief.** Conversations are not portable between agents, so the next candidate starts a new conversation from the original brief. Its prompt does not describe the partial work; mention in the brief that the workspace may already contain changes if that matters.
- **Lazy preparation.** A candidate is bootstrapped and authenticated only when it is tried. Its CLI must exist in the sandbox image, and its credentials must be declared. Every candidate is validated before the first one starts.
- **Captured history.** Conversations of failed candidates are still captured for [recovery](../failure-recovery/).

## Results, events and usage

`result.fallback` records the candidate that produced the result and why earlier candidates stopped:

```ts
import type { FallbackRecord } from "@elie-laloum/outpost";

function describe(fallback: FallbackRecord | undefined) {
  if (!fallback) return "single agent";
  const tried = fallback.attempts.map(
    (attempt) => `${attempt.name}: ${attempt.failure}`,
  );
  return `${fallback.selected.name} after ${tried.join(", ")}`;
}
```

Each handover emits a `fallback` [agent event](../live-events/) with `from`, `to`, `failure` and `message`, which journals record. Pass numbers continue across candidates. `result.usage` and workflow budgets include the tokens reported by failed candidates.

`resume()` and `fork()` continue with the selected candidate. Passing a fallback agent with an explicit `continuation`, or to `attach()`, is rejected: a conversation belongs to one agent.

## When every candidate fails

The last error is rethrown, with the stopped candidates in `recoveryDetails(error).fallback`. When every candidate hit a limit, the error has code `quota` and its reset is the earliest one, reported only if every candidate provided a reset.

With [`onQuota`](../quota-pauses/), the workflow then pauses until that reset. The resumed attempt starts again from the first candidate, with the original brief instead of a conversation continuation: `agentTask` reuses its sandbox, and an automatically integrated `isolatedTask` starts from the interrupted branch. `quotaResume: "restart"` starts from scratch. In a [speculative race](../candidate-selection/), a candidate reports status `quota` only when all its fallbacks hit a limit.

## Limits

Outage and limit patterns come from recorded CLI and provider formats; an unrecognized message does not trigger a fallback. Replaying a journal that contains a handover is not supported. The behavior is covered by deterministic tests with simulated agents, not by live campaigns against exhausted accounts.

API: [fallbackAgent](../../reference/fallbackagent/) · [FallbackAgentOptions](../../reference/fallbackagentoptions/) · [FallbackRecord](../../reference/fallbackrecord/) · [unavailableFault](../../reference/unavailablefault/).
