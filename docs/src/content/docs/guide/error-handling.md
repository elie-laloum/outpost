---
title: "Handle errors"
description: "Read dispatch errors and workflow failures, then decide what can be retried."
---

## Understand failure results

The error you receive depends on the operation. A dispatch rejects its promise when the agent fails; a workflow normally returns a result containing its failed tasks. Use the table below to choose how to handle each call.

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

Catch an `OutpostError` to read its code, message and recovery information. Keep other errors visible by throwing them again; recovery details help locate work retained after a failed dispatch.

```ts
import { OutpostError, dispatch, recoveryDetails } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

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

API reference: [OutpostError](../../reference/outposterror/).

Use the recovery information to find work that was preserved after a failure.

API reference: [recoveryDetails](../../reference/recoverydetails/).

[Recover work](../recovery/) shows how to use these locations.

## Fault codes

API reference: [FaultCode](../../reference/faultcode/).

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

<!-- tabs -->

```ts title="deploy.ts"
import { defineTask, OutpostError } from "@elie-laloum/outpost";

export const deploy = defineTask({
  key: "deploy",
  perform: () => {
    throw new OutpostError("provider", "Deployment returned HTTP 502", {
      status: 502,
    });
  },
});
```

```ts title="run-deploy.ts"
import { reportValue } from "./reporter.ts";
import {
  defineWorkflow,
  WorkflowFailure,
  OutpostError,
} from "@elie-laloum/outpost";
import { deploy } from "./deploy.ts";

export const result = await defineWorkflow("release", [deploy]).start();
try {
  result.unwrap();
} catch (error) {
  if (!(error instanceof WorkflowFailure)) throw error;
  const [first] = error.result.errors;
  if (first instanceof OutpostError) reportValue(first.code, first.details);
  // Example output: provider { status: 502 }
}
```

<!-- check:run -->

`WorkflowFailure.cause` is the first entry of `errors`, so `quotaFault()` and `unavailableFault()` work on it directly. `unwrap()` also throws for `"paused"`, `"waiting-input"` and `"cancelled"` runs.

API reference: [WorkflowFailure](../../reference/workflowfailure/), [WorkflowBudgetExceeded](../../reference/workflowbudgetexceeded/), [WorkflowUsageUnavailable](../../reference/workflowusageunavailable/), [LoopTaskExhausted](../../reference/looptaskexhausted/), [ResponseError](../../reference/responseerror/), [ReplayDivergence](../../reference/replaydivergence/) and [TransportConflict](../../reference/transportconflict/).

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
