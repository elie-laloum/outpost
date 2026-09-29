---
title: "Verification loops"
description: "Let an agent try again with the check's feedback until the check accepts its work or the rounds run out, all in one workflow task."
---

## Repeat until a check accepts

`defineLoopTask()` alternates two callbacks inside one workflow task: `attempt` produces a candidate, `check` accepts it or says what is wrong.

<!-- flow -->

1. **Attempt**: Your `attempt(context, feedback)` returns a candidate.
   - **First round**: The callback receives `undefined` as feedback.
   - **Later rounds**: The callback receives the text of the last rejection.
2. **Check**: Your `check(context, candidate)` returns a verdict.
   - **Accept**: Return `{ done: true }`.
   - **Reject**: Return `{ done: false, feedback }` with a text.
3. **Next**: The verdict decides.
   - **Next round**: A rejection feeds the next attempt.
   - **Done**: The accepted candidate becomes the task's value.
   - **Exhausted**: A rejection in the last round fails the task.
     - `LoopTaskExhausted`

```ts
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
console.log(result.value(fix)); // { round: 2, feedback: 'Cover the missing edge case.' }
```

<!-- check:run -->

Round 1 is rejected; round 2 receives the feedback and is accepted. `after`, `condition` and [`cache`](../task-cache/) work as on [other tasks](../task-dependencies/).

## Code, then run a command

The agent works in `attempt`, the tests run in `check`, both in one warm [sandbox](../sandbox-sessions/).

```ts
import {
  createSandbox,
  defineAgentTask,
  defineLoopTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/fix-tests" },
});

const fix = defineLoopTask({
  key: "fix-tests",
  maxRounds: 4,
  async attempt(context, feedback) {
    const coding = defineAgentTask({
      key: "coder",
      sandbox,
      request: () => ({
        brief: { text: `Fix the failing tests and commit.\n${feedback ?? ""}` },
      }),
    });
    const result = await coding.perform(context);
    return { summary: result.text, commits: result.commits.length };
  },
  async check(context) {
    const tests = await sandbox.command({
      executable: "npm",
      arguments: ["test"],
      signal: context.signal,
    });
    return tests.status === 0
      ? { done: true }
      : { done: false, feedback: `${tests.stdout}\n${tests.stderr}` };
  },
});

const result = await defineWorkflow("fix-tests", [fix]).start();
result.unwrap();
console.log(result.value(fix).summary);
```

`coding.perform(context)` ties the agent's tokens and cancellation to the loop and its [budget](../budgets/). `coder` is a helper: only `fix` goes in the workflow. `attempt` returns JSON because a [checkpoint](../durable-runs/) saves every candidate, even rejected ones.

A failing `npm test` returns a nonzero `status`, and its output becomes the feedback. You decide where it goes: the next brief, as here, or a [continued conversation](../conversations/).

:::caution
A direct `sandbox.dispatch()` escapes the loop's budget and cancellation. Pass it `context.signal` and report its tokens with `context.reportUsage()`.
:::

## Ask a second agent to review

`check` can dispatch a reviewer and turn its [typed response](../typed-responses/) into a verdict. Both agents count against the same budget.

```ts
import {
  createAgent,
  createClaudeHarness,
  defineAgentTask,
  defineJsonResponse,
} from "@elie-laloum/outpost";
import type {
  LoopCheckResult,
  LoopTaskContext,
  Sandbox,
} from "@elie-laloum/outpost";
import { z } from "zod";

declare const sandbox: Sandbox;

const reviewer = createAgent({
  harness: createClaudeHarness({ authentication: "account" }),
});
const review = defineJsonResponse({
  tag: "review",
  schema: z.object({ approved: z.boolean(), feedback: z.string() }),
});

async function reviewChanges(
  context: LoopTaskContext,
): Promise<LoopCheckResult> {
  const reviewing = defineAgentTask({
    key: "reviewer",
    sandbox,
    request: () => ({
      agent: reviewer,
      response: review,
      brief: {
        text: 'Review the last commit. End with <review>{"approved": false, "feedback": "What to change"}</review>.',
      },
    }),
  });
  const { value } = await reviewing.perform(context);
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
