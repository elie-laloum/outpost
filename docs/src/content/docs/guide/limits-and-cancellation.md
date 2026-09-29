---
title: "Limits and cancellation"
description: "Bound how long an agent task runs, repeat its brief until the agent declares it done, and stop it from your code."
---

## Bound one task

Every dispatch already runs under default limits. Set your own on the request, next to the brief.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

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
```

If the agent runs longer than 20 minutes, or stays silent for 5, the promise rejects with an [`OutpostError`](../error-handling/) of code `timeout`. The sandbox is released; the branch keeps what the agent committed.

## Choose a limit

| Option          | Bounds                                                                | Default                   | When reached                          |
| --------------- | --------------------------------------------------------------------- | ------------------------- | ------------------------------------- |
| `deadlineMs`    | Each agent turn: one CLI process, or one turn of the built-in harness | 1 hour                    | Rejects with code `timeout`           |
| `idleMs`        | Time without any output from the agent                                | 10 minutes                | Rejects with code `timeout`           |
| `idleWarningMs` | Silence before each `warning` event                                   | 60 seconds                | Emits an event; the agent keeps going |
| `passes`        | How many times the brief is sent                                      | 1                         | Resolves with `completed: false`      |
| `until`         | Completion markers that end the passes                                | `<outpost>done</outpost>` | Stops at the first matching pass      |
| `settleMs`      | Time the agent may keep running after its marker                      | 60 seconds                | Stops the process, keeps the result   |
| `signal`        | Cancellation from your code                                           | None                      | Rejects with the signal’s reason      |

Your `observe` callback receives a `stopped` event whose `reason` says which one ended the process: `deadline`, `idle-timeout`, `completion` or `aborted`.

## Cancel from your code

Pass an `AbortSignal`. Here, Ctrl+C stops the agent instead of leaving it running in the sandbox.

```ts
import { dispatch, recoveryDetails } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

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

## Repeat the brief until the agent declares it done

`passes` sends the brief again when a pass ends without a completion marker. Ask for the marker in the brief: Outpost does not add it.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/flaky-tests" },
  brief: {
    text: "Fix the flaky tests and commit. When every test passes, end your answer with READY_FOR_REVIEW.",
  },
  passes: 3,
  until: "READY_FOR_REVIEW",
});
console.log(result.completed, result.completion);
```

Each pass starts a new conversation on the same branch, so it sees the previous commits. Outpost stops at the first pass whose answer contains a marker. `until` also accepts a list; `until: []` disables matching and runs every pass.

`result.completed` is `true` when a marker matched, and `result.completion` names it. A dispatch that exhausts its passes still resolves, with `completed: false`.

:::caution
A marker is the agent’s declaration, not proof. Run your tests before relying on it; [Verification loops](../verification-loops/) repeat the agent until your check passes.
:::

If the agent writes its marker but keeps running, Outpost stops it `settleMs` after its last output. The result is kept and `warn` receives a message.

## Bound workspace stages

`limits` sets deadlines on the Git and file steps around the agent. Pass it to `dispatch()`, `createWorkspace()` or `createSandbox()`.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "integrate" },
  brief: { text: "Update the lockfile and commit the change." },
  limits: { gitMs: 120_000, mergeMs: 120_000 },
});
```

| Field       | Bounds                                                    | Default                              |
| ----------- | --------------------------------------------------------- | ------------------------------------ |
| `copyMs`    | Copying `copies` into the worktree; each sandbox transfer | 60 seconds; 120 seconds per transfer |
| `gitMs`     | Each Git command that prepares the worktree               | 30 seconds                           |
| `collectMs` | Reading the new commits after the agent                   | 30 seconds                           |
| `mergeMs`   | Merging the work branch into its base (`integrate`)       | 30 seconds                           |

## Other limits

<!-- features -->

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
