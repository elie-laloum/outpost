---
title: "Fallback agents"
description: "Hand a dispatch to another agent or model when the first one hits a usage limit or its service is down."
---

## Compose a fallback agent

List the candidates in the order to try them, and the failures that hand over in `on`. Here Claude Opus runs first, then Claude Sonnet, then the Codex agent from [Setup](../setup/).

```ts
import {
  createAgent,
  createClaudeHarness,
  createFallbackAgent,
  dispatch,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const claude = createClaudeHarness({ authentication: "account" });
const agent = createFallbackAgent(
  [
    createAgent({ harness: claude, model: "opus" }),
    createAgent({ harness: claude, model: "sonnet" }),
    coder,
  ],
  { on: ["quota", "unavailable"] },
);

const result = await dispatch({
  repository,
  sandboxProvider,
  agent,
  brief: { text: "Fix the failing tests." },
});
console.log(result.fallback?.selected.name);
```

A fallback agent goes wherever an agent does, including `createSandbox()`, agent tasks and [competing candidates](../speculation/). Each candidate keeps its own [authentication](../authentication/), so a subscription can fall back to an API key.

## Choose when to hand over

`on` is required and names one or both categories.

| `on` value    | Hands over when the turn fails with                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| `quota`       | A usage or rate limit: `OutpostError` code `quota`, as classified on [Quota pauses](../quota-pauses/). |
| `unavailable` | A service outage: overload, HTTP 408, 5xx or 529, or a connection or transport failure.                |

Any other failure, including cancellation and deadlines, is rethrown at once. An outage keeps its code (`process` or `provider`); detect it with `unavailableFault(error)`.

## What the next candidate sees

<!-- features -->

- **Same workspace**: Files and commits left by the failed candidate stay in place; nothing is reset.
- **Original brief**: It starts a new conversation from the brief; the failed conversation is still captured for [recovery](../recovery/).
- **Lazy preparation**: It is set up and signed in only when its turn comes.

:::note
The next candidate is not told about the partial work. If that matters, say in the brief that the workspace may already contain changes.
:::

## Read which candidate answered

A dispatch through a fallback agent returns `result.fallback`:

| Field      | What it holds                                                                             |
| ---------- | ----------------------------------------------------------------------------------------- |
| `selected` | `index`, `name` and `model` of the candidate that produced the result.                    |
| `attempts` | Candidates that stopped before it, each with `failure`, `message` and optional `resetAt`. |

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
