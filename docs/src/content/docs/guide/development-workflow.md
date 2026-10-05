---
title: "Build a development workflow"
description: "Take a ticket through questions, a reviewed plan, failing tests and verified code."
---

This example takes a ticket for a CSV export through a complete development workflow. An agent asks the owner for missing requirements and proposes a plan. After approval, agents write failing tests, implement the change and submit it to a reviewer. The accepted work is committed on `outpost/shop-142`, with separate commits for tests and implementation.

The workflow follows one rule from [redline](https://github.com/elie-laloum/redline), a ticket-to-merge-request system built on Outpost: **code decides, agents judge**. Agents answer and edit files; your code validates their answers, runs the tests, refuses edits outside each role’s files and commits.

## What this example covers

<!-- features -->

- [Interactive tasks](../interactive-tasks/): The agent questions the owner, one point at a time, then returns the plan.
- [Approvals](../approvals/): The owner approves the plan before any file changes.
- [Verification loops](../verification-loops/): Write, check, feed the rejection back, within a number of rounds.
- [Typed responses](../typed-responses/): The reviewer returns a validated verdict.
- [Sandbox sessions](../sandbox-sessions/): One warm sandbox keeps dependencies between agents and test runs.
- [Durable runs](../durable-runs/): A checkpoint keeps answers, the plan and finished loops between processes.

## Write the script

Save the files shown in the tabs next to the `outpost.config.ts` from [Installation](../setup/). They are grouped by role: clarify the ticket, prepare the sandbox, write tests, implement the change and expose the functions your application calls. Each file has one responsibility; the imports connect them.

### Clarify the ticket and approve the plan

Start with the ticket, its expected plan and the approval gate.

<!-- tabs -->

```ts title="ticket.ts"
import { z } from "zod";

export const ticket = {
  key: "SHOP-142",
  text: "Add a CSV export to the orders list.",
};
export const planSchema = z.object({
  summary: z.string().min(1),
  tests: z.array(z.string()).min(1),
  code: z.array(z.string()).min(1),
});
```

```ts title="frame.ts"
import { defineInteractiveAgentTask } from "@elie-laloum/outpost";
import { repository, coder, sandboxProvider } from "./outpost.config.ts";
import { ticket } from "./ticket.ts";

export const frame = defineInteractiveAgentTask({
  key: "frame",
  repository,
  agent: coder,
  sandboxProvider,
  brief: [
    `Ticket ${ticket.key}: ${ticket.text}`,
    "Read the code first. Then ask the owner about what the ticket leaves open, one point at a time.",
    'When nothing is ambiguous, complete with {"summary": string, "tests": string[], "code": string[]}:',
    "the behaviors to test, then the changes to make.",
  ].join("\n"),
  actors: ["owner"],
  maxTurns: 10,
});
```

```ts title="plan.ts"
import { defineTask } from "@elie-laloum/outpost";
import { frame } from "./frame.ts";
import { planSchema } from "./ticket.ts";

export const plan = defineTask({
  key: "plan",
  after: [frame],
  perform: (context) => planSchema.parse(context.value(frame).output),
});
```

```ts title="approval.ts"
import { defineApprovalTask } from "@elie-laloum/outpost";
import { plan } from "./plan.ts";
import { ticket } from "./ticket.ts";

export const review = defineApprovalTask({
  key: "review",
  after: [plan],
  prompt: `Deliver this plan for ${ticket.key}?`,
  actors: ["owner"],
});
```

```ts title="loop.types.ts"
import type { LoopTaskContext, LoopCheckResult } from "@elie-laloum/outpost";

export type LoopCheck = (context: LoopTaskContext) => Promise<LoopCheckResult>;
export type LoopAttempt = (
  context: LoopTaskContext,
  feedback: string | undefined,
) => Promise<{ summary: string }>;
```

### Prepare and reuse the sandbox

These helpers open one sandbox when delivery starts and reuse it for commands and agent turns.

<!-- tabs -->

```ts title="branch.ts"
import { ticket } from "./ticket.ts";

export const branch = `outpost/${ticket.key.toLowerCase()}`;
export const isTest = (file: string) =>
  /(^|\/)test\/|\.test\.[cm]?[jt]s$/.test(file);
```

```ts title="workbench.ts"
import type { Sandbox } from "@elie-laloum/outpost";
import { createSandbox } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";
import { branch } from "./branch.ts";

export let opened: Sandbox | undefined;
export async function workbench() {
  opened ??= await createSandbox({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: branch },
    hooks: { sandboxReady: [{ executable: "npm", arguments: ["ci"] }] },
  });
  return opened;
}
export async function closeWorkbench() {
  await opened?.close();
  opened = undefined;
}
```

```ts title="commands.ts"
import type { LoopTaskContext } from "@elie-laloum/outpost";
import { workbench } from "./workbench.ts";

export async function run(
  context: LoopTaskContext,
  executable: string,
  ...args: string[]
) {
  return (await workbench()).command({
    executable,
    arguments: args,
    retain: 20_000,
    signal: context.signal,
  });
}
```

```ts title="git.ts"
import type { LoopTaskContext } from "@elie-laloum/outpost";
import { run } from "./commands.ts";

export async function changedFiles(context: LoopTaskContext) {
  const status = await run(context, "git", "status", "--porcelain", "-uall");
  return status.stdout
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3));
}
export async function commit(context: LoopTaskContext, message: string) {
  await run(context, "git", "add", "--all");
  const result = await run(context, "git", "commit", "--message", message);
  if (result.status !== 0) throw new Error(result.stderr);
}
```

```ts title="ask.ts"
import type { LoopTaskContext } from "@elie-laloum/outpost";
import { defineAgentTask } from "@elie-laloum/outpost";
import { workbench } from "./workbench.ts";

export async function ask(
  context: LoopTaskContext,
  key: string,
  lines: string[],
) {
  const role = defineAgentTask({
    key,
    sandbox: await workbench(),
    request: () => ({ brief: { text: lines.join("\n") } }),
  });
  return (await role.perform(context)).text;
}
```

### Write and check the tests

The test loop rejects changes outside test files and requires the tests to fail before committing.

<!-- tabs -->

```ts title="verdict.ts"
import { defineJsonResponse } from "@elie-laloum/outpost";
import { z } from "zod";

export const verdict = defineJsonResponse({
  tag: "review",
  schema: z.object({ approved: z.boolean(), feedback: z.string() }),
});
```

```ts title="write-zones.ts"
import type { LoopTaskContext } from "@elie-laloum/outpost";
import { changedFiles } from "./git.ts";
import { isTest } from "./branch.ts";

export async function checkTestFiles(context: LoopTaskContext) {
  const files = await changedFiles(context);
  const outside = files.filter((file) => !isTest(file));
  if (!files.length) return "No test changed.";
  if (outside.length) return `Revert:\n${outside.join("\n")}`;
}
export async function checkCodeFiles(context: LoopTaskContext) {
  const edited = (await changedFiles(context)).filter(isTest);
  if (edited.length) return `Revert:\n${edited.join("\n")}`;
}
```

```ts title="test-attempt.ts"
import type { LoopAttempt } from "./loop.types.ts";
import { ask } from "./ask.ts";
import { ticket } from "./ticket.ts";
import { plan } from "./plan.ts";

export const testAttempt: LoopAttempt = async (context, feedback) => {
  const summary = await ask(context, "test-writer", [
    `Ticket ${ticket.key}: ${ticket.text}`,
    "Write tests for these behaviors. Edit test files only and do not commit.",
    ...context.value(plan).tests.map((item) => `- ${item}`),
    feedback ? `Your last attempt was rejected:\n${feedback}` : "",
  ]);
  return { summary };
};
```

```ts title="test-check.ts"
import type { LoopCheck } from "./loop.types.ts";
import { checkTestFiles } from "./write-zones.ts";
import { run } from "./commands.ts";
import { commit } from "./git.ts";
import { ticket } from "./ticket.ts";

export const testCheck: LoopCheck = async (context) => {
  const rejection = await checkTestFiles(context);
  if (rejection) return { done: false, feedback: rejection };
  const result = await run(context, "npm", "test");
  if (result.status === 0)
    return { done: false, feedback: "The tests already pass." };
  await commit(context, `test(${ticket.key}): ${ticket.text}`);
  return { done: true };
};
```

```ts title="tests.ts"
import { defineLoopTask } from "@elie-laloum/outpost";
import { review } from "./approval.ts";
import { testAttempt } from "./test-attempt.ts";
import { testCheck } from "./test-check.ts";

export const tests = defineLoopTask({
  key: "tests",
  after: [review],
  maxRounds: 4,
  attempt: testAttempt,
  check: testCheck,
});
```

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

```ts title="checkpoint.ts"
import {
  createWorkflowCheckpointStore,
  createLocalTransport,
} from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";
import { ticket } from "./ticket.ts";

export const checkpoint = {
  store: createWorkflowCheckpointStore({
    transporter: createLocalTransport({
      directory: `${repository}/.outpost/storage`,
    }),
  }),
  runId: ticket.key,
  version: "1",
};
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

Your application renders `questions` in a form and `plan` on a review page. Each call rebuilds the same workflow and checkpoint, so it can run in any process on the machine that holds the repository.

## Understand the steps

<!-- canvas -->

- [Your code](../durable-runs/): `progress()`, `answer()` and `decide()` resume the run from its checkpoint.
  - host
  - → **Frame**: `workflow.start()`
- [Workflow](../typed-workflows/): Five tasks; each one starts when the previous one succeeds.
  - workflow
  - **Frame**: `defineInteractiveAgentTask()`, one sandbox per turn
    - → **Owner**: one question at a time
  - **Plan**: `planSchema` rejects a malformed plan
  - **Review**: `defineApprovalTask()`, the only gate
    - → **Owner**: plan
  - **Tests**: `defineLoopTask()`, at most 4 rounds
    - → **Test writer**: tests to write
  - **Code**: `defineLoopTask()`, at most 6 rounds
    - → **Developer**: code to write
    - → **Reviewer**: green changes
  - → **Checkpoint**: answers, plan, rounds
- [Owner](../approvals/): Answers through your application and decides on the plan.
  - CLI · HTTP
  - → **Frame**: answer
  - → **Review**: approve or reject
- [Sandbox](../sandbox-sessions/): One warm sandbox on `outpost/shop-142`, opened by the first round of `tests`.
  - sandbox
  - **Test writer**: edits test files only
  - **Developer**: never edits a test
  - **Reviewer**: returns `{ approved, feedback }`
  - → **Branch**: commits made by your code
- **Branch**: `outpost/shop-142` in `.outpost/workspaces`, kept for review; nothing is merged or pushed.
  - host
- [Checkpoint](../durable-runs/): `.outpost/storage`: any process on the machine can resume the run.
  - host

Each check runs in a fixed order, and the first rejection becomes the next round’s feedback:

| Loop    | Check, in order                        | Rejects when                                 |
| ------- | -------------------------------------- | -------------------------------------------- |
| `tests` | Write zone                             | No test changed, or a non-test file changed  |
| `tests` | Red run: `npm test`                    | The tests already pass: they prove nothing   |
| `code`  | Write zone                             | A test file changed                          |
| `code`  | Green run: `npm test`                  | The tests fail; their output is the feedback |
| `code`  | Reviewer agent, `defineJsonResponse()` | `approved` is `false`                        |

Agents never commit. Each loop commits only once every check accepts, so a rejected round leaves its changes for the next attempt to fix. `answer()` and `decide()` return after the next agent turns, which can take minutes: from a web request, hand them to a [job queue worker](../job-queues/).

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

- **Rejection ends the run**: A rejected plan skips delivery and the run ends `failed`. Start a new `runId` with the owner’s note in the brief.
- **Malformed plan**: `plan` throws, and the run fails without asking the agent again. Use a [loop task](../verification-loops/) to let the agent fix its own JSON.
- **Rounds run out**: A loop whose last check rejects fails with `LoopTaskExhausted`; finished tasks stay in the checkpoint and the branch keeps the committed tests.
- **Same machine**: The repository, its worktrees and the framing conversation must be reachable by the process that answers.
- **Interrupted round**: After a crash right after a commit, the resumed check finds no change and spends a round. Inspect the branch before you resume.
- **Retained work**: Framing keeps its worktree on an `outpost/interactive-…` branch; [clean it up](../retention/) when done.

API: [defineInteractiveAgentTask](../../reference/defineinteractiveagenttask/) · [defineApprovalTask](../../reference/defineapprovaltask/) · [defineLoopTask](../../reference/definelooptask/) · [defineAgentTask](../../reference/defineagenttask/) · [defineJsonResponse](../../reference/definejsonresponse/) · [createSandbox](../../reference/createsandbox/) · [LoopTaskExhausted](../../reference/looptaskexhausted/).
