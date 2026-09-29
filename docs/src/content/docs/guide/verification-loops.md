---
title: "Verification loops"
description: "Repeat work with feedback until a check accepts it or a limit is reached."
---

`defineLoopTask()` alternates `attempt` and `check` inside one workflow node. It is available since 8.0.0. A rejected check supplies text feedback to the next round; a successful check exposes the accepted attempt result to dependent tasks.

```ts
import { defineLoopTask, defineWorkflow } from "@elie-laloum/outpost";

const fix = defineLoopTask({
  key: "fix",
  maxRounds: 3,
  attempt: (ctx, feedback) => ({ round: ctx.round, feedback: feedback ?? "" }),
  check: (_, candidate) =>
    candidate.round === 2
      ? { done: true }
      : { done: false, feedback: "Cover the missing edge case." },
});
const result = await defineWorkflow("verified", [fix]).start({
  budget: { attempts: 3 },
});
result.unwrap();
console.log(result.value(fix).round); // 2
```

<!-- check:run -->

## Code, then run a command

Reuse a caller-owned sandbox prepared as in [sandbox sessions](../sandbox-sessions/). Calling a `defineAgentTask`'s `perform(ctx)` connects streaming usage, cancellation and observation to the loop context. Return a JSON projection of its result when using checkpoints: the full dispatch result has continuation methods and cannot be persisted as JSON.

```ts
import { defineAgentTask, defineLoopTask } from "@elie-laloum/outpost";
import type { Sandbox } from "@elie-laloum/outpost";

declare const session: Sandbox;
const fix = defineLoopTask({
  key: "fix-tests",
  maxRounds: 4,
  timeoutMs: 300_000,
  async attempt(ctx, feedback) {
    const run = defineAgentTask({
      key: "coder",
      sandbox: session,
      request: () => ({
        brief: { text: `Fix the failing tests.\n${feedback ?? ""}` },
      }),
    });
    const result = await run.perform(ctx);
    return { text: result.text, conversation: result.conversation ?? null };
  },
  async check(ctx) {
    const run = await session.command({
      executable: "npm",
      arguments: ["test"],
      signal: ctx.signal,
    });
    return run.status === 0
      ? { done: true }
      : { done: false, feedback: `${run.stdout}\n${run.stderr}` };
  },
});
```

Only `fix` belongs in the workflow graph; `coder` is an execution helper. The caller owns sandbox closure and Git integration. Concurrent nodes must not dispatch into the same exclusively owned session.

## Use a second agent to review

`check` may call another `defineAgentTask.perform(ctx)` on a reviewer sandbox and turn its structured response into `{ done: true }` or `{ done: false, feedback }`. Both agents' reported usage counts against the same workflow budget. Use [structured responses](../typed-responses/) to validate the review decision.

A direct `session.dispatch()` inside a callback does not automatically connect its usage or signal to the workflow. Prefer the helper above; custom integrations must forward `ctx.signal`, propagate observation and report usage synchronously through `ctx.reportUsage`, including failed requests. Do not also report a helper's final totals: it already reconciles streamed counters.

Feedback is passed unchanged to `attempt`; the callback chooses its prompt. To continue an existing conversation, explicitly set the dispatch request's `continuation` to a supported conversation ID and use the feedback in the next brief. See [conversation history](../conversations/) for capture and restoration. The loop never silently selects a continuation strategy or restores a sandbox.

## Limits and failures

`maxRounds` is a positive safe integer and bounds logical rounds. `ctx.round` starts at one. Each new round consumes one workflow attempt; replaying an interrupted phase consumes another, even when only the check runs. Tokens are counted as callbacks report them. Set [workflow budgets](../budgets/) and pass cancellation to every operation.

`timeoutMs` covers both callbacks in one round execution and renews on phase replay. Cancellation and deadlines are cooperative: callbacks must honor `ctx.signal`. An exception from either callback fails the task without automatically consuming the remaining rounds. A rejected check is not a technical retry. There is no loop-level `retry` option.

When the last check rejects, `WorkflowResult.errors` includes `LoopTaskExhausted`, with `key`, `maxRounds` and the last `feedback`. Dependent tasks cannot run. `result.unwrap()` still uses the ordinary workflow failure contract.

## Checkpoint and resume

Use the existing [durable-run configuration](../durable-runs/). Each round records `attempt`, `check` and `complete` transitions in `TaskRecord.rounds`, and emits `WorkflowEvent` with `type: "loop"`, `round` and `phase`. Exhaustive event consumers must handle this new type. Observer delivery remains separate from durable storage.

The candidate is saved before `check`. On resume, a saved candidate goes directly to verification; completed rejected rounds supply feedback without rerunning their callbacks. A saved accepted round can finish the task without another callback. Resuming an incomplete workflow still requires `resume: "retry-incomplete"`, because an interrupted callback may already have performed effects. An exhausted round limit stays exhausted. Changing `maxRounds` invalidates the checkpoint identity; change the checkpoint version when callback implementations or inputs change.

All persisted candidates must be lossless JSON or top-level `undefined`, even those rejected later. Without a checkpoint, arbitrary in-memory values are allowed and round records omit candidate outputs. Checkpoints preserve workflow progress, not sandbox files or executable callbacks: recreate compatible definitions and restore the intended workspace/session before resuming.

`ctx.idempotencyKey` is stable for one execution, task, logical round and callback phase; attempt and check have distinct keys. Effect services must persist their own deduplication receipts. Re-executed paid model calls are still new consumption; do not reuse an old usage receipt to hide their cost.

API: [defineLoopTask](../../reference/definelooptask/) · [LoopTaskOptions](../../reference/looptaskoptions/) · [LoopTaskContext](../../reference/looptaskcontext/) · [LoopTaskExhausted](../../reference/looptaskexhausted/).
