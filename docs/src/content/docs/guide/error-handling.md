---
title: "Errors"
description: "Know how each Outpost call reports failure, read an OutpostError and its fault code, and decide what to retry."
---

## Know how each call fails

Outpost reports a failure in one of three ways: a rejected promise, a result status, or an exception you ask for.

| Call                                                                 | On failure                                                                                                                                              |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dispatch()`, `sandbox.dispatch()`                                   | Rejects with an `OutpostError`.                                                                                                                         |
| `createSandbox()`                                                    | Rejects with an `OutpostError`.                                                                                                                         |
| `sandbox.command()`                                                  | Resolves with `status`, even non-zero. Rejects when stopped: code `timeout` after `deadlineMs`, `aborted` when the sandbox closes.                      |
| `defineCommandTask()`                                                | Fails its task with code `process` on a non-zero exit.                                                                                                  |
| `workflow.start()`                                                   | Resolves with `status` and `errors`, also when you cancel it (`"cancelled"`). `result.unwrap()` throws a `WorkflowFailure` unless `status` is `"done"`. |
| `steering.send()`                                                    | Rejects with code `steering` when the instruction is not delivered.                                                                                     |
| `dispatch()` or `sandbox.command()` cancelled with your own `signal` | Rejects with the signal’s reason, as passed to `abort()`, not an `OutpostError`.                                                                        |

## Read an OutpostError

```ts
import { OutpostError, dispatch, recoveryDetails } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

try {
  await dispatch({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/lint-fix" },
    brief: { text: "Fix the lint errors and commit the change." },
  });
} catch (error) {
  if (!(error instanceof OutpostError)) throw error;
  console.error(error.code, error.message);
  console.error(recoveryDetails(error));
}
```

| Field                    | What it holds                                                                                                                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `code`                   | A stable [fault code](#fault-codes). Branch on it, not on `message`.                                                                                                                            |
| `message`                | A readable explanation for people.                                                                                                                                                              |
| `details`                | Structured context: `status` and `retryAfterMs` for HTTP failures, `resetAt` for quotas, `unavailable` for outages, `status`, `stdout`, `stderr` and `conversation` for a failed agent process. |
| `cause`                  | The original failure, when Outpost reclassified one.                                                                                                                                            |
| `recoveryDetails(error)` | Where the work survived, such as `branch`, `directory`, `commits`, `transcript` and `logReference`. Also works on errors that are not `OutpostError`.                                           |

Two failures also name their location in `details`:

| Failure                             | Code        | Field                                       |
| ----------------------------------- | ----------- | ------------------------------------------- |
| Remote changes could not be applied | `workspace` | `details.recovery`: the transfer directory. |
| Automatic integration failed        | `conflict`  | `details.directory`: the kept worktree.     |

[Recover work](../recovery/) shows how to use these locations.

## Fault codes

| Code            | Meaning                              | Typical cause                                                                                       | What to do                                                                                      |
| --------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `configuration` | The call or its settings are invalid | Unsupported model setting, missing account credential file, sandbox already busy or closed          | Fix the code or configuration. Retrying does not help.                                          |
| `process`       | A process failed                     | Agent exited non-zero or without a final event; a command task exited non-zero                      | Read `details.stderr`; check `unavailableFault(error)`.                                         |
| `timeout`       | A deadline elapsed                   | `deadlineMs`, `idleMs`, a command `deadlineMs`, `start({ timeoutMs })`, a model request             | Raise the limit or split the task. See [Limits and cancellation](../limits-and-cancellation/).  |
| `aborted`       | Outpost stopped the operation        | The sandbox closed during a command or turn                                                         | Run again in an open sandbox.                                                                   |
| `workspace`     | A worktree or file operation failed  | Unsafe path or symlink, storage reservation refused, remote Git synchronization failed              | Inspect the retained worktree and recovery files.                                               |
| `conflict`      | Someone else changed the state       | Worktree in use, branch checked out elsewhere, host edits during synchronization, failed merge      | Resolve on the host, then run again.                                                            |
| `prompt`        | The brief could not be rendered      | Missing prompt variable, failing prompt command                                                     | Fix the [brief](../briefs/).                                                                    |
| `response`      | An answer could not be parsed        | `ResponseError`: missing tag, invalid JSON, schema rejection; invalid model or MCP reply            | Allow repairs. See [Typed responses](../typed-responses/).                                      |
| `session`       | A conversation is unavailable        | Conversation not found in native storage, missing or unsupported transcript                         | Check the [conversation](../conversations/) you resume or fork.                                 |
| `provider`      | The sandbox or model service failed  | Provider sandbox already disposed, file transfer failed, non-quota HTTP error from a model provider | Check the provider; `unavailableFault(error)` flags outages.                                    |
| `limit`         | A built-in harness limit was reached | `maxSteps`, `maxToolCalls`, `maxOutputTokens`, token budget, delegation depth                       | Raise the [harness](../harness/) limit or narrow the brief.                                     |
| `quota`         | A usage or rate limit was reached    | Terminal usage limit from an agent CLI, HTTP 429 or quota error from a model provider               | Wait for `resetAt`, [pause the workflow](../quota-pauses/) or [fall back](../fallback-agents/). |
| `replay`        | A replay differs from its journal    | `ReplayDivergence`                                                                                  | Record again. See [Replay without a model](../record-replay/).                                  |
| `steering`      | An instruction was not delivered     | The dispatch ended first, or the controller closed                                                  | Send it to the next dispatch. See [Steering](../steering/).                                     |

## Recognize quotas and outages

`quotaFault(error)` and `unavailableFault(error)` search the error and up to seven wrapped causes. Each returns `undefined` when the failure is something else.

```ts
import { quotaFault, unavailableFault } from "@elie-laloum/outpost";

function classify(error: unknown): string {
  const quota = quotaFault(error);
  if (quota) return `Usage limit, resets at ${quota.resetAt ?? "unknown"}`;
  const outage = unavailableFault(error);
  if (outage) return `Service unavailable: ${outage.message}`;
  return "Other failure";
}
```

An outage keeps its `process`, `provider` or `timeout` code. Use `unavailableFault()` to recognize it, not the code. [Quota pauses](../quota-pauses/) explains which signals count as a quota.

A connection timeout keeps the code `timeout`. When a CLI agent last reported a connection failure, `details.agentDiagnostic` is `"connection"` and `unavailableFault()` treats it as an outage. [Diagnostics](../diagnostics/) shows how to check the endpoint.

## Handle a failed workflow

A failing task does not make `start()` reject. Read `status` and `errors`, or call `unwrap()` to throw.

```ts
import {
  OutpostError,
  WorkflowFailure,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";

const deploy = defineTask({
  key: "deploy",
  perform: () => {
    throw new OutpostError("provider", "Deployment returned HTTP 502", {
      status: 502,
    });
  },
});
const result = await defineWorkflow("release", [deploy]).start();
try {
  result.unwrap();
} catch (error) {
  if (!(error instanceof WorkflowFailure)) throw error;
  const [first] = error.result.errors;
  if (first instanceof OutpostError) console.log(first.code, first.details);
}
// provider { status: 502 }
```

<!-- check:run -->

`WorkflowFailure.cause` is the first entry of `errors`, so `quotaFault()` and `unavailableFault()` work on it directly. `unwrap()` also throws for `"paused"`, `"waiting-input"` and `"cancelled"` runs.

| Error                      | Where it appears                                                          | Read                                                 |
| -------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------- |
| `WorkflowFailure`          | Thrown by `unwrap()`                                                      | `result`: status, tasks, errors, usage.              |
| `WorkflowBudgetExceeded`   | `result.errors` when a [budget](../budgets/) runs out                     | `dimension`, `limit`, `observed`.                    |
| `WorkflowUsageUnavailable` | `result.errors` when a token budget cannot be enforced                    | Set `budget.attempts` and timeouts.                  |
| `LoopTaskExhausted`        | `result.errors` after the last [loop](../verification-loops/) round fails | `key`, `maxRounds`, `feedback`.                      |
| `ResponseError`            | A dispatch or agent task with a response contract                         | `tag`, `raw`; code `response`.                       |
| `ReplayDivergence`         | A replay agent                                                            | `kind`, `turn`, `expected`, `actual`; code `replay`. |
| `TransportConflict`        | A conditional [storage](../storage/) write                                | `key`. Read the object again before retrying.        |

## Retry deliberately

A task retries only when it has a `retry` policy; `accepts` chooses which errors qualify; without it, every failure is retried. Retry outages and timeouts; do not retry `configuration`, `prompt` or `conflict`.

```ts
import { defineTask, unavailableFault } from "@elie-laloum/outpost";

const report = defineTask({
  key: "report",
  retry: {
    attempts: 3,
    delayMs: 1_000,
    backoff: "exponential",
    accepts: (error) => unavailableFault(error) !== undefined,
  },
  perform: () => "Replace with your request",
});
```

A retry runs the whole task again and can repeat its effects. [Concurrency, retries and timeouts](../concurrency-and-retries/) covers the options and `Retry-After`.

## Log safely

Log `code`, `message` and `recoveryDetails(error)`. Do not dump `details` or the whole error: a failed process carries the agent’s `stdout` and `stderr`, and `ResponseError.raw` holds its answer. Both can contain repository content or secrets the agent printed.

For the full record of a failed dispatch, open its [journal](../journals/) from the `logReference` recovery field.

## Limits

- Some failures are plain `Error`s: invalid task or workflow definitions, and a [checkpoint](../durable-runs/) already owned by another runner.
- A `timeout` does not prove that external effects were rolled back. Check the retained branch before running again.

API: [OutpostError](../../reference/outposterror/) · [FaultCode](../../reference/faultcode/) · [recoveryDetails](../../reference/recoverydetails/) · [quotaFault](../../reference/quotafault/) · [unavailableFault](../../reference/unavailablefault/) · [WorkflowFailure](../../reference/workflowfailure/) · [WorkflowResult](../../reference/workflowresult/) · [ResponseError](../../reference/responseerror/) · [TransportConflict](../../reference/transportconflict/)
