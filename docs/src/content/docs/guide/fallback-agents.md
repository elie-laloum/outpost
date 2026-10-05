---
title: "Use a fallback agent"
description: "Hand work to another agent when a configured quota or availability error occurs."
---

## Compose a fallback agent

Create a fallback agent with an ordered list of candidates and the fault kinds in `on`. Outpost tries the next candidate only when the current one fails with a covered quota or availability fault.

<!-- tabs -->

```ts title="fallback.ts"
import {
  createClaudeHarness,
  createFallbackAgent,
  createAgent,
} from "@elie-laloum/outpost";
import { coder } from "./outpost.config.ts";

export const claude = createClaudeHarness({ authentication: "account" });
export const agent = createFallbackAgent(
  [
    createAgent({ harness: claude, model: "opus" }),
    createAgent({ harness: claude, model: "sonnet" }),
    coder,
  ],
  { on: ["quota", "unavailable"] },
);
```

```ts title="run.ts"
import { reportValue } from "./reporter.ts";
import { dispatch } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { agent } from "./fallback.ts";

export const result = await dispatch({
  repository,
  sandboxProvider,
  agent,
  brief: { text: "Fix the failing tests." },
});
reportValue(result.fallback?.selected.name);
// Example output: claude
```

A fallback agent goes wherever an agent does, including `createSandbox()`, agent tasks and [competing candidates](../speculation/). Each candidate keeps its own [authentication](../authentication/), so a subscription can fall back to an API key.

## Choose when to hand over

`on` is required and names one or both categories.

API reference: [FallbackAgentOptions](../../reference/fallbackagentoptions/).

Any other failure, including cancellation and deadlines, is rethrown at once. One exception: a deadline reached after the agent reported a connection failure counts as an outage. An outage keeps its code (`process`, `provider` or `timeout`); detect it with `unavailableFault(error)`.

## What the next candidate sees

<!-- features -->

- **Same workspace**: Files and commits left by the failed candidate stay in place; nothing is reset.
- **Original brief**: It starts a new conversation from the brief; the failed conversation is still captured for [recovery](../recovery/).
- **Lazy preparation**: It is set up and signed in only when its turn comes.

:::note
The next candidate is not told about the partial work. If that matters, say in the brief that the workspace may already contain changes.
:::

## Read which candidate answered

After a fallback, you can inspect which candidates were tried and which one answered.

API reference: [DispatchResult](../../reference/dispatchresult/) and [FallbackAttempt](../../reference/fallbackattempt/).

Each handover emits a `fallback` [agent event](../progress/) with `from`, `to`, `failure` and `message`. `result.usage` and workflow [budgets](../budgets/) include the tokens of failed candidates. `resume()` and `fork()` on the result continue with the selected candidate.

## When every candidate fails

The last error is rethrown, and `recoveryDetails(error).fallback` lists the stopped candidates. If they all hit a limit, the error has code `quota` and carries the earliest reset, provided every candidate reported one.

With [`onQuota`](../quota-pauses/), the workflow pauses until that reset. The resumed attempt starts again from the first candidate, with the original brief:

| Task                                  | Resumed attempt                                                            |
| ------------------------------------- | -------------------------------------------------------------------------- |
| `defineAgentTask`                     | Runs in the task’s sandbox, on the work already there.                     |
| `defineIsolatedTask` with integration | Starts from the interrupted branch; `quotaResume: "restart"` starts fresh. |

In a [competing-candidates race](../speculation/), a fallback candidate reports status `quota` when the error that ends its list is a limit.

## Limits

- Only recognized limit and outage messages hand over. A retry notice the CLI prints while it keeps retrying does not.
- Every candidate must support the dispatch options, such as steering or response repairs; this is checked before the first one starts.
- In a container or on the host, every candidate’s CLI must already be installed. Only [cloud sandboxes](../cloud-sandboxes/) install a missing CLI when it is tried.
- A conversation belongs to one agent: a fallback agent rejects an explicit `continuation` and `attach()`.
- A [replay](../record-replay/) reproduces a recorded handover but returns no `result.fallback`.

API: [createFallbackAgent](../../reference/createfallbackagent/) · [FallbackAgentOptions](../../reference/fallbackagentoptions/) · [FallbackRecord](../../reference/fallbackrecord/) · [unavailableFault](../../reference/unavailablefault/) · [recoveryDetails](../../reference/recoverydetails/)
