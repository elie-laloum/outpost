---
title: "Build a development workflow"
description: "Take a ticket through questions, a reviewed plan, failing tests and verified code."
---

Build on [test preparation](../prepare-change-tests/) to implement the change, run tests and request a review. Keep its planning files and the shared helpers listed below. Replace `workflow.ts` and `view.ts` with this page’s versions. Use a fresh ticket key: a checkpoint cannot be reused with a different graph.

Keep these shared files: `branch.ts`, `workbench.ts`, `commands.ts`, `git.ts`, `ask.ts`, `loop.types.ts`, `write-zones.ts`, `test-attempt.ts`, `test-check.ts`, `tests.ts`.

<!-- example:include plan-a-change ticket.ts frame.ts plan.ts approval.ts checkpoint.ts -->
<!-- example:include prepare-change-tests branch.ts workbench.ts commands.ts git.ts ask.ts loop.types.ts write-zones.ts test-attempt.ts test-check.ts tests.ts -->

[Download all files](../../guide-examples/development-workflow.tar.gz). Extract into a dedicated directory, run `npm install`, then adapt `outpost.config.ts` using [Installation](../setup/). The commands below identify the scripts to run.

This lesson reuses the previous lesson’s files, not its saved execution. It defines another graph and needs its own `runId`: planning runs again. For one path from ticket to implementation, start directly with the [development workflow](../development-workflow/) project.

<!-- canvas -->

- **Plan**: Clarify the ticket and propose tests and code.
  - Agent
  - → **Approval**: plan saved
- **Approval**: The owner reviews the plan.
  - You
  - → **Tests**: approved
  - → **Stop**: rejected
- **Tests**: Write and check tests expected to fail, then commit them.
  - Workflow
  - → **Implement**: tests accepted
  - → **Stop**: attempts exhausted
- **Implement**: Request the code change without changing the tests.
  - Agent
  - → **Check**: change ready
- **Check**: Check files, run npm test and obtain the review.
  - Workflow
  - → **Implement**: test output or review feedback
  - → **Branch**: all checks pass
  - → **Stop**: attempts exhausted
- **Branch**: Commit and retain the change for review; no merge.
  - Workflow
- **Stop**: Keep work and the reason for inspection.
  - Workflow

The review verdict belongs to the implementation loop. Save its contract in `verdict.ts`.

```ts title="verdict.ts"
import { defineJsonResponse } from "@elie-laloum/outpost";
import { z } from "zod";

export const verdict = defineJsonResponse({
  tag: "review",
  schema: z.object({ approved: z.boolean(), feedback: z.string() }),
});
```

## Write the script

Add these files to the previous example’s directory.

### Implement and review the change

The implementation loop checks the write boundary, runs the tests and asks a reviewer before committing.

<!-- tabs -->

```ts title="code-attempt.ts"
import type { LoopAttempt } from "./loop.types.ts";
import { ask } from "./ask.ts";
import { ticket } from "./ticket.ts";
import { plan } from "./plan.ts";

export const codeAttempt: LoopAttempt = async (context, feedback) => {
  const summary = await ask(context, "developer", [
    `Ticket ${ticket.key}: ${ticket.text}`,
    "Make the failing tests pass. Do not edit tests and do not commit.",
    ...context.value(plan).code.map((item) => `- ${item}`),
    feedback ? `Your last attempt was rejected:\n${feedback}` : "",
  ]);
  return { summary };
};
```

```ts title="green-check.ts"
import type { LoopCheck } from "./loop.types.ts";
import { run } from "./commands.ts";

export const greenCheck: LoopCheck = async (context) => {
  const result = await run(context, "npm", "test");
  const feedback = `${result.stdout}\n${result.stderr}`;
  return result.status === 0 ? { done: true } : { done: false, feedback };
};
```

```ts title="review-brief.ts"
import type { LoopTaskContext } from "@elie-laloum/outpost";
import { ticket } from "./ticket.ts";
import { plan } from "./plan.ts";

export function reviewBrief(context: LoopTaskContext) {
  return {
    text: [
      `Review the uncommitted changes for ${ticket.key} against this plan:`,
      ...context.value(plan).code.map((item) => `- ${item}`),
      'End with <review>{"approved": false, "feedback": "What to change"}</review>.',
    ].join("\n"),
  };
}
```

```ts title="review-changes.ts"
import type { LoopTaskContext } from "@elie-laloum/outpost";
import { defineAgentTask } from "@elie-laloum/outpost";
import { workbench } from "./workbench.ts";
import { verdict } from "./verdict.ts";
import { reviewBrief } from "./review-brief.ts";

export async function reviewChanges(context: LoopTaskContext) {
  const reviewing = defineAgentTask({
    key: "reviewer",
    sandbox: await workbench(),
    request: () => ({ response: verdict, brief: reviewBrief(context) }),
  });
  return (await reviewing.perform(context)).value;
}
```

```ts title="code-check.ts"
import type { LoopCheck } from "./loop.types.ts";
import { checkCodeFiles } from "./write-zones.ts";
import { greenCheck } from "./green-check.ts";
import { reviewChanges } from "./review-changes.ts";
import { commit } from "./git.ts";
import { ticket } from "./ticket.ts";

export const codeCheck: LoopCheck = async (context) => {
  const edited = await checkCodeFiles(context);
  if (edited) return { done: false, feedback: edited };
  const green = await greenCheck(context);
  if (!green.done) return green;
  const value = await reviewChanges(context);
  if (!value.approved) return { done: false, feedback: value.feedback };
  await commit(context, `feat(${ticket.key}): ${ticket.text}`);
  return { done: true };
};
```

### Compose the workflow and its checkpoint

Compose the tasks and checkpoint, then close the sandbox after each call.

<!-- tabs -->

```ts title="code.ts"
import { defineLoopTask } from "@elie-laloum/outpost";
import { tests } from "./tests.ts";
import { codeAttempt } from "./code-attempt.ts";
import { codeCheck } from "./code-check.ts";

export const code = defineLoopTask({
  key: "code",
  after: [tests],
  maxRounds: 6,
  attempt: codeAttempt,
  check: codeCheck,
});
```

```ts title="workflow.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { frame } from "./frame.ts";
import { plan } from "./plan.ts";
import { review } from "./approval.ts";
import { tests } from "./tests.ts";
import { code } from "./code.ts";

export const workflow = defineWorkflow("develop", [
  frame,
  plan,
  review,
  tests,
  code,
]);
```

```ts title="view.ts"
import type { WorkflowResult } from "@elie-laloum/outpost";
import { plan } from "./plan.ts";
import { branch } from "./branch.ts";
import { code } from "./code.ts";

export function view(result: WorkflowResult) {
  if (result.status === "waiting-input")
    return { questions: result.inputRequests };
  if (result.status === "paused") return { plan: result.value(plan) };
  result.unwrap();
  return { branch, summary: result.value(code).summary };
}
```

```ts title="start.ts"
import { workflow } from "./workflow.ts";
import { view } from "./view.ts";
import { checkpoint } from "./checkpoint.ts";
import { closeWorkbench } from "./workbench.ts";

export async function start(
  options: Parameters<typeof workflow.start>[0] = {},
) {
  try {
    return view(await workflow.start({ ...options, checkpoint }));
  } finally {
    await closeWorkbench();
  }
}
export const progress = () => start();
```

### Submit answers and decisions

Your application imports the entry points from `run.ts` to submit answers and decisions.

<!-- tabs -->

```ts title="answer.ts"
import { workflow } from "./workflow.ts";
import { checkpoint } from "./checkpoint.ts";
import { start } from "./start.ts";

export async function answer(actor: string, requestId: string, value: string) {
  const { inputRequests } = await workflow.start({ checkpoint });
  const request = inputRequests.find((pending) => pending.id === requestId);
  if (!request) throw new Error("This question is no longer pending");
  const { executionId, key } = request;
  return start({ answers: [{ executionId, key, requestId, actor, value }] });
}
```

```ts title="decide.ts"
import { workflow } from "./workflow.ts";
import { checkpoint } from "./checkpoint.ts";
import { start } from "./start.ts";

export async function decide(
  actor: string,
  action: "approve" | "reject",
  reason: string,
) {
  const current = await workflow.start({ checkpoint });
  const pending = current.tasks.find((task) => task.key === "review")?.pause;
  if (!pending) throw new Error("No plan awaits review");
  const { executionId } = current;
  const requestId = pending.id;
  const decision = { executionId, key: "review", requestId, actor, reason };
  return start({ decisions: [{ ...decision, action }] });
}
```

```ts title="run.ts"
import { progress } from "./start.ts";
import { answer } from "./answer.ts";
import { decide } from "./decide.ts";

export { progress } from "./start.ts";
export { answer } from "./answer.ts";
export { decide } from "./decide.ts";
```

Run `node main.ts` to inspect the next question, pending plan or final summary. Your application renders `questions` in a form and `plan` on a review page. Each call rebuilds the same workflow and checkpoint, so it can run in any process on the machine that holds the repository.

Create this entry point to start the workflow and print its state.

```ts title="main.ts"
import { progress } from "./run.ts";

console.log(await progress());
```

## Understand the steps

Each check runs in a fixed order, and the first rejection becomes the next round’s feedback:

| Loop    | Check, in order                        | Rejects when                                 |
| ------- | -------------------------------------- | -------------------------------------------- |
| `tests` | Write zone                             | No test changed, or a non-test file changed  |
| `tests` | Red run: `npm test`                    | The tests already pass: they prove nothing   |
| `code`  | Write zone                             | A test file changed                          |
| `code`  | Green run: `npm test`                  | The tests fail; their output is the feedback |
| `code`  | Reviewer agent, `defineJsonResponse()` | `approved` is `false`                        |

The brief asks agents not to commit. Each loop commits only once every check accepts, so a rejected round leaves its changes for the next attempt to fix. `answer()` and `decide()` return after the next agent turns, which can take minutes: from a web request, hand them to a [job queue worker](../job-queues/).

:::caution
The write zone and the tests are checked by your code, but “do not commit” and “edit test files only” are instructions. An agent can still run `git commit` itself: review the branch before you merge it.
:::

## Adapt the example

| Variation               | Change                                                                                                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Read the ticket         | Add a first `defineTask()` that fetches the ticket from your tracker and returns `{ key, text }`; read it with `context.value()` in the briefs instead of the constant.             |
| An adversarial reviewer | Pass another agent in the reviewer’s request, such as Claude Code with `createClaudeHarness()`: a different model misses different things ([Choose an agent](../choose-an-agent/)). |
| Stricter checks         | Add a typecheck and a lint to the green run, or a second reviewer that checks the tests fail for the right reason, as redline does.                                                 |
| Open a merge request    | Once `progress()` returns `branch`, push it from the host and open a draft pull request with `gh pr create --draft --head`, or a merge request with `glab mr create --draft`.       |
| Several repositories    | One loop pair per repository, chained with `after` in dependency order ([Change several repositories](../multi-repository-change/)).                                                |

## Limits

- **Rejection ends the run**: A rejected plan skips delivery and the run ends `rejected`. Start a new `runId` with the owner’s note in the brief.
- **Malformed plan**: `plan` throws, and the run fails without asking the agent again. Use a [loop task](../verification-loops/) to let the agent fix its own JSON.
- **Rounds run out**: A loop whose last check rejects fails with `LoopTaskExhausted`; finished tasks stay in the checkpoint and the branch keeps the committed tests.
- **Same machine**: The repository, its worktrees and the framing conversation must be reachable by the process that answers.
- **Interrupted round**: After a crash right after a commit, the resumed check finds no change and spends a round. Inspect the branch before you resume.
- **Retained work**: Framing keeps its worktree on an `outpost/interactive-…` branch; [clean it up](../retention/) when done.

API: [defineInteractiveAgentTask](../../reference/defineinteractiveagenttask/) · [defineApprovalTask](../../reference/defineapprovaltask/) · [defineLoopTask](../../reference/definelooptask/) · [defineAgentTask](../../reference/defineagenttask/) · [defineJsonResponse](../../reference/definejsonresponse/) · [createSandbox](../../reference/createsandbox/) · [LoopTaskExhausted](../../reference/looptaskexhausted/).

<!-- Retained section anchors for existing bookmarks. -->

<span id="clarify-the-ticket-and-approve-the-plan"></span>

[Clarify and approve a change](../plan-a-change/).

<span id="what-this-example-covers"></span>

[Build a development workflow](../development-workflow/).

<span id="prepare-and-reuse-the-sandbox"></span>
<span id="write-and-check-the-tests"></span>
