---
title: "Budget workflow usage"
description: "Shared attempt and observed token limits across workflow tasks."
sidebar:
  order: 4
---

Set `WorkflowOptions.budget` on each execution. Admission and usage accounting are shared across concurrent tasks, dependencies and retries; each call to `start()` has fresh counters.

```ts
import { task, workflow, WorkflowBudgetExceeded } from "@elie-laloum/outpost";

const inspect = task({
  key: "inspect",
  perform(context) {
    context.reportUsage({ input: 100, cached: 20, output: 25 });
    return "Synthetic local result";
  },
});
const result = await workflow("bounded", [inspect]).start({
  concurrency: 2,
  budget: { attempts: 4, usage: { input: 10_000, output: 2_000 } },
});
console.log(result.usage.attempts, result.usage.tokens);
for (const error of result.errors) {
  if (error instanceof WorkflowBudgetExceeded)
    console.log(error.dimension, error.limit, error.observed);
}
result.unwrap();
```

## Admission and cancellation

`attempts` limits calls to task `perform`, including retries and command tasks. A false condition consumes no attempt. The last admitted attempt may finish successfully. If another admission would exceed the limit, pending tasks are cancelled and already admitted work drains normally. A workflow requiring that denied admission ends as `failed`, even when `stopOnError` is false. Conditions are evaluated before admission; keep them free of paid work. Internal agent passes and structured-response repair turns belong to the same task attempt; the attempt limit does not bound model calls inside it.

`usage` accepts independent `input`, `cached`, `cacheCreated` and `output` limits. Reaching or exceeding any configured counter aborts the workflow signal, prevents further attempts and cooperatively cancels running tasks. The reporting task is cancelled too, even if it was about to return successfully. The scheduler waits for all admitted work to settle and clean up. Custom tasks must honor `context.signal`; JavaScript work that ignores cancellation cannot be forcibly stopped.

Limits must be nonnegative safe integers. Zero prevents the first task attempt. A limit only causes failure if work needs admission or reports usage at that boundary; an empty workflow still succeeds. Omitted limits are unrestricted. External cancellation retains the workflow's `cancelled` status; budget exhaustion alone produces `failed` with `WorkflowBudgetExceeded` in `errors` and through `WorkflowFailure.result` after `unwrap()`.

## What gets counted

`agentTask` and `isolatedTask` automatically forward normalized streaming usage deltas, including usage from failed attempts. Summary totals reconcile each pass by adding only positive differences. Final successful result totals fill any remaining gap. A lower transcript-derived summary never subtracts tokens already observed; the workflow total can therefore be higher than `DispatchResult.usage`. Different retries have separate pass accounting. Observer failures do not stop accounting or change the outcome.

Generic `task` code reports **deltas** through `context.reportUsage(usage)`, once per increment, during the active attempt. Do not report a cumulative total repeatedly or report again for an `agentTask`/`isolatedTask` result. Conditions and settled attempts cannot report usage. Reports after cancellation are still counted while that attempt is cleaning up. Command tasks consume admissions but have no automatic model usage. Nested workflows have their own budgets; direct dispatches inside custom tasks require explicit reporting or task wrappers.

`result.usage` is an immutable snapshot containing `attempts` and `tokens`. `Usage` preserves agent-specific counters: cached input may overlap `input` for some agents. There is deliberately no combined token total or invented currency conversion.

These are **observed usage limits, not guaranteed billing caps**. Agents may report only after a turn, omit usage on failure, or already have several requests running when a limit is reached. Concurrent work and cancellation can overshoot the threshold. Configure vendor-side controls separately when a billing limit is required.

See [workflow metrics and OpenTelemetry](../../operations/telemetry/) for monitoring these counters.
