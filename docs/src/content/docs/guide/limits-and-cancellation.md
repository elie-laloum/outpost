---
title: "Set deadlines and cancel work"
description: "Bound agent execution time, control repeated passes and cancel from your code."
---

Use the [setup configuration](../setup/) for these dispatch examples. Choose deadlines before starting unattended work, and decide how you will inspect a retained branch after cancellation. The [workflow budget](../budgets/) bounds cumulative work separately.

## Set task deadlines

Set deadlines alongside the brief when a task needs tighter limits than the defaults. You can bound the whole agent turn and the time it may remain silent.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/parser-fix" },
  brief: { text: "Fix the parser and commit the change." },
  deadlineMs: 20 * 60_000,
  idleMs: 5 * 60_000,
});
console.log(result.text);
// Example output: Fixed the failing tests and committed the change.
```

If the agent runs longer than 20 minutes, or stays silent for 5, the promise rejects with an [`OutpostError`](../error-handling/) of code `timeout`. The sandbox is released; the branch keeps what the agent committed.

## Choose a limit

`deadlineMs` bounds a dispatch’s total duration; `idleMs` watches its silence. A task attempt uses `timeoutMs`, while the workflow sets its own deadline with `start({ timeoutMs })`. Start with a total deadline, then add silence detection only when a long quiet operation should be interrupted.

API reference: [DispatchOptions](../../reference/dispatchoptions/).

Your `observe` callback receives a `stopped` event whose `reason` says which one ended the process: `deadline`, `idle-timeout`, `completion` or `aborted`.

## Cancel from your code

Pass an `AbortSignal`. Here, Ctrl+C stops the agent instead of leaving it running in the sandbox.

```ts
import { dispatch, recoveryDetails } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const controller = new AbortController();
process.once("SIGINT", () => controller.abort("cancelled by user"));

try {
  await dispatch({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/refactor" },
    brief: { text: "Refactor the auth module and commit the change." },
    signal: controller.signal,
  });
} catch (error) {
  console.error(error, recoveryDetails(error));
}
```

The promise rejects with the value passed to `abort()`, here `"cancelled by user"`. `AbortSignal.timeout(ms)` works the same way for a deadline that spans every pass.

| After a stop     | `dispatch()`                                 | `sandbox.dispatch()` in a [session](../sandbox-sessions/) |
| ---------------- | -------------------------------------------- | --------------------------------------------------------- |
| Agent process    | Its process group and descendants terminated | Same                                                      |
| Sandbox          | Released                                     | Still running, ready for the next dispatch                |
| Worktree, branch | Kept; `recoveryDetails(error)` gives both    | Kept                                                      |

To change the agent’s direction without stopping it, [steer it](../steering/) instead.

<span id="repeat-the-brief-until-the-agent-declares-it-done"></span>

For this step, follow [Repeat a brief across passes](../agent-passes/).

## Set Git and file operation deadlines

`limits` sets deadlines on the Git and file steps around the agent. Pass it to `dispatch()`, `createWorkspace()` or `createSandbox()`.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "integrate" },
  brief: { text: "Update the lockfile and commit the change." },
  limits: { gitMs: 120_000, mergeMs: 120_000 },
});
```

API reference: [StageLimits](../../reference/stagelimits/).

## Other limits

<!-- features -->

- [Detect repeated activity](../stuck-agents/): Stop, warn or redirect an agent repeating tools or edits.

- [Budgets](../budgets/): Token and attempt ceilings shared by the tasks of a workflow.
- [Concurrency, retries and timeouts](../concurrency-and-retries/): `timeoutMs` for each task attempt and for a whole run.
- [Built-in harness](../harness/): `limits` on steps, tool calls and usage of one agent loop.
- [Sandbox sessions](../sandbox-sessions/): `deadlineMs` and `signal` on a single command.
- [Write a brief](../briefs/): `expansionMs` bounds the shell commands of a file brief.
- [Steering a running agent](../steering/): Change direction without cancelling.

## Limits

- Every duration must be a positive number: `0` does not disable a limit.
- `passes` above 1 cannot be combined with `response` or `continuation`.
- Stopping an agent does not roll anything back. Commits and files it already wrote stay on the branch.

API: [dispatch](../../reference/dispatch/) · [DispatchOptions](../../reference/dispatchoptions/) · [DispatchResult](../../reference/dispatchresult/) · [StageLimits](../../reference/stagelimits/) · [recoveryDetails](../../reference/recoverydetails/) · [AgentObservation](../../reference/agentobservation/).
