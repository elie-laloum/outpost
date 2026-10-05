---
title: "Check work and retry"
description: "Use test output or a review to accept an agent’s work or request another attempt."
---

## Repeat until a check accepts

Define an attempt and a check with `defineLoopTask()`. The check accepts the result or returns feedback for the next attempt. Set `maxRounds` so a result that never passes ends with a bounded failure.

<!-- canvas -->

- **Attempt**: Your `attempt(context, feedback)` returns a candidate.
  - Steps
  - **First round**: The callback receives `undefined` as feedback.
  - **Later rounds**: The callback receives the text of the last rejection.
  - → **Check**: then
- **Check**: Your `check(context, candidate)` returns a verdict.
  - Steps
  - **Accept**: Return `{ done: true }`.
  - **Reject**: Return `{ done: false, feedback }` with a text.
  - → **Next**: then
- **Next**: The verdict decides.
  - Steps
  - **Next round**: A rejection feeds the next attempt.
  - **Done**: The accepted candidate becomes the task's value.
  - **Exhausted**: A rejection in the last round fails the task.
    - `LoopTaskExhausted`

```ts
import { reportValue } from "./reporter.ts";
import { defineLoopTask, defineWorkflow } from "@elie-laloum/outpost";

const fix = defineLoopTask({
  key: "fix",
  maxRounds: 3,
  attempt: (context, feedback) => ({
    round: context.round,
    feedback: feedback ?? "",
  }),
  check: (_, candidate) =>
    candidate.round === 2
      ? { done: true }
      : { done: false, feedback: "Cover the missing edge case." },
});

const result = await defineWorkflow("verified", [fix]).start();
result.unwrap();
reportValue(result.value(fix));
// Example output: { round: 2, feedback: 'Cover the missing edge case.' }
```

<!-- check:run -->

Round 1 is rejected; round 2 receives the feedback and is accepted. `after`, `condition` and [`cache`](../task-cache/) work as on [other tasks](../task-dependencies/).

## Code, then run a command

The agent works in `attempt`, the tests run in `check`, both in one warm [sandbox](../sandbox-sessions/).

Keep the sandbox, attempt and check separate so each step is easy to follow.

<!-- tabs -->

```ts title="loop-sandbox.ts"
import { createSandbox } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

export function openLoopSandbox() {
  return createSandbox({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/fix-tests" },
  });
}
```

```ts title="coding-task.ts"
import type { Sandbox } from "@elie-laloum/outpost";
import { defineAgentTask } from "@elie-laloum/outpost";

export function codingTask(sandbox: Sandbox, feedback?: string) {
  return defineAgentTask({
    key: "coder",
    sandbox,
    request: () => ({
      brief: { text: `Fix the failing tests and commit.\n${feedback ?? ""}` },
    }),
  });
}
```

```ts title="loop-attempt.ts"
import type { Sandbox, LoopTaskContext } from "@elie-laloum/outpost";
import { codingTask } from "./coding-task.ts";

export function createAttempt(sandbox: Sandbox) {
  return async (context: LoopTaskContext, feedback: string | undefined) => {
    const result = await codingTask(sandbox, feedback).perform(context);
    return { summary: result.text, commits: result.commits.length };
  };
}
```

```ts title="loop-check.ts"
import type {
  Sandbox,
  LoopTaskContext,
  LoopCheckResult,
} from "@elie-laloum/outpost";

export function createCheck(sandbox: Sandbox) {
  return async (context: LoopTaskContext): Promise<LoopCheckResult> => {
    const tests = await sandbox.command({
      executable: "npm",
      arguments: ["test"],
      signal: context.signal,
    });
    return tests.status === 0
      ? { done: true }
      : { done: false, feedback: `${tests.stdout}\n${tests.stderr}` };
  };
}
```

```ts title="fix-loop.ts"
import type { Sandbox } from "@elie-laloum/outpost";
import { defineLoopTask } from "@elie-laloum/outpost";
import { createAttempt } from "./loop-attempt.ts";
import { createCheck } from "./loop-check.ts";

export function defineFix(sandbox: Sandbox) {
  return defineLoopTask({
    key: "fix-tests",
    maxRounds: 4,
    attempt: createAttempt(sandbox),
    check: createCheck(sandbox),
  });
}
```

Run `run-loop.ts`; it keeps the sandbox open until the workflow finishes.

<!-- tabs -->

```ts title="run-loop.ts"
import { reportValue } from "./reporter.ts";
import { openLoopSandbox } from "./loop-sandbox.ts";
import { defineFix } from "./fix-loop.ts";
import { defineWorkflow } from "@elie-laloum/outpost";

await using sandbox = await openLoopSandbox();
export const fix = defineFix(sandbox);
export const result = await defineWorkflow("fix-tests", [fix]).start();
result.unwrap();
reportValue(result.value(fix).summary);
// Example output: Fixed the parser and verified the tests.
```

`coding.perform(context)` ties the agent's tokens and cancellation to the loop and its [budget](../budgets/). `coder` is a helper: only `fix` goes in the workflow. `attempt` returns JSON because a [checkpoint](../durable-runs/) saves every candidate, even rejected ones.

A failing `npm test` returns a nonzero `status`, and its output becomes the feedback. You decide where it goes: the next brief, as here, or a [continued conversation](../conversations/).

:::caution
A direct `sandbox.dispatch()` escapes the loop's budget and cancellation. Pass it `context.signal` and report its tokens with `context.reportUsage()`.
:::

## Ask a second agent to review

`check` can dispatch a reviewer and turn its [typed response](../typed-responses/) into a verdict. Both agents count against the same budget.

<!-- tabs -->

```ts title="review-settings.ts"
import {
  createAgent,
  createClaudeHarness,
  defineJsonResponse,
} from "@elie-laloum/outpost";
import { z } from "zod";

export const reviewer = createAgent({
  harness: createClaudeHarness({ authentication: "account" }),
});
export const review = defineJsonResponse({
  tag: "review",
  schema: z.object({ approved: z.boolean(), feedback: z.string() }),
});
export const brief = {
  text: 'Review the last commit. End with <review>{"approved": false, "feedback": "What to change"}</review>.',
};
```

```ts title="reviewing-task.ts"
import type { Sandbox } from "@elie-laloum/outpost";
import { defineAgentTask } from "@elie-laloum/outpost";
import { reviewer, review, brief } from "./review-settings.ts";

export declare const sandbox: Sandbox;
export function reviewingTask() {
  return defineAgentTask({
    key: "reviewer",
    sandbox,
    request: () => ({ agent: reviewer, response: review, brief }),
  });
}
```

```ts title="review-changes.ts"
import type { LoopTaskContext, LoopCheckResult } from "@elie-laloum/outpost";
import { reviewingTask } from "./reviewing-task.ts";

export async function reviewChanges(
  context: LoopTaskContext,
): Promise<LoopCheckResult> {
  const { value } = await reviewingTask().perform(context);
  return value.approved
    ? { done: true }
    : { done: false, feedback: value.feedback };
}
```

Pass it as `check: reviewChanges`. The request's `agent` replaces the sandbox's agent for this dispatch only.

## Limits

| Limit or event         | What happens                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| `maxRounds`            | Caps the rounds, resumes included.                                                               |
| Workflow attempts      | Each round, and each replay of an interrupted round, counts against `budget.attempts`.           |
| `timeoutMs`            | Bounds each round. It stops callbacks that honor `context.signal`.                               |
| An exception           | Fails the task at once. A loop task has no `retry` option.                                       |
| The last check rejects | The task fails with `LoopTaskExhausted`, which holds the last `feedback`. Dependents do not run. |

[Fix a failing CI build](../fix-failing-ci/) handles each outcome in a complete script.

## Checkpoint and resume

With a [checkpoint](../durable-runs/), each candidate is saved before `check`. On resume, a saved candidate goes straight to `check`, and rejected rounds are not rerun.

An interrupted round replays only with `resume: "retry-incomplete"`, since it may already have changed files. Changing `maxRounds` makes the checkpoint incompatible.

Each task record lists its `rounds`, and each phase emits a `loop` workflow event. `context.idempotencyKey` differs per round and phase, to deduplicate effects as in [Job queues and workers](../job-queues/).

API: [defineLoopTask](../../reference/definelooptask/) · [LoopTaskOptions](../../reference/looptaskoptions/) · [LoopTaskContext](../../reference/looptaskcontext/) · [LoopCheckResult](../../reference/loopcheckresult/) · [LoopTaskExhausted](../../reference/looptaskexhausted/) · [defineAgentTask](../../reference/defineagenttask/).
