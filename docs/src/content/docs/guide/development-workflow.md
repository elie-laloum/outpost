---
title: "Build a development workflow"
description: "Take a ticket to a reviewed branch: an agent questions its owner and plans, the owner approves the plan, then agents write failing tests first and code until the tests pass and a reviewer agrees. Your code checks every step and makes every commit."
---

A ticket says “add a CSV export to the orders list”. An agent asks its owner what the ticket leaves open and returns a plan; the owner approves it. Agents then write the tests, which must fail, and the code, which must make them pass and satisfy a reviewer agent. The work lands on `outpost/shop-142`, one commit for the tests and one for the code.

The workflow follows one rule from [redline](https://github.com/elie-laloum/redline), a ticket-to-merge-request system built on Outpost: **code decides, agents judge**. Agents answer and edit files; your code validates their answers, runs the tests, refuses edits outside each role’s files and commits.

## What you use

<!-- features -->

- [Interactive tasks](../interactive-tasks/): The agent questions the owner, one point at a time, then returns the plan.
  - `defineInteractiveAgentTask()`
- [Approvals](../approvals/): The owner approves the plan before any file changes.
  - `defineApprovalTask()`
- [Verification loops](../verification-loops/): Write, check, feed the rejection back, within a number of rounds.
  - `defineLoopTask()`
  - `defineAgentTask()`
- [Typed responses](../typed-responses/): The reviewer returns a validated verdict.
  - `defineJsonResponse()`
- [Sandbox sessions](../sandbox-sessions/): One warm sandbox keeps dependencies between agents and test runs.
  - `createSandbox()`
  - `sandbox.command()`
- [Durable runs](../durable-runs/): A checkpoint keeps answers, the plan and finished loops between processes.
  - `createWorkflowCheckpointStore()`

## The code

Three files sit next to the `outpost.config.mts` from [Setup](../setup/): framing with the owner, delivery in the sandbox, and the functions your application calls.

<!-- tabs -->

```ts title="framing.ts"
import {
  defineApprovalTask,
  defineInteractiveAgentTask,
  defineTask,
} from "@elie-laloum/outpost";
import { z } from "zod";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

export const ticket = {
  key: "SHOP-142",
  text: "Add a CSV export to the orders list.",
};

const planSchema = z.object({
  summary: z.string().min(1),
  tests: z.array(z.string()).min(1),
  code: z.array(z.string()).min(1),
});

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

// The plan rules: code checks the agent's JSON before anyone reads it.
export const plan = defineTask({
  key: "plan",
  after: [frame],
  perform: (context) => planSchema.parse(context.value(frame).output),
});

export const review = defineApprovalTask({
  key: "review",
  after: [plan],
  prompt: `Deliver this plan for ${ticket.key}?`,
  actors: ["owner"],
});
```

```ts title="delivery.ts"
import {
  createSandbox,
  defineAgentTask,
  defineJsonResponse,
  defineLoopTask,
} from "@elie-laloum/outpost";
import type { LoopTaskContext, Sandbox } from "@elie-laloum/outpost";
import { z } from "zod";
import { plan, review, ticket } from "./framing.ts";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

export const branch = `outpost/${ticket.key.toLowerCase()}`;
const isTest = (file: string) => /(^|\/)test\/|\.test\.[cm]?[jt]s$/.test(file);
let opened: Sandbox | undefined;

// Opens the sandbox on the first delivery task only, so questions never wait for npm ci.
async function workbench() {
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

async function run(
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

async function changedFiles(context: LoopTaskContext) {
  const status = await run(context, "git", "status", "--porcelain", "-uall");
  return status.stdout
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3));
}

async function commit(context: LoopTaskContext, message: string) {
  await run(context, "git", "add", "--all");
  const result = await run(context, "git", "commit", "--message", message);
  if (result.status !== 0) throw new Error(result.stderr);
}

async function ask(context: LoopTaskContext, key: string, lines: string[]) {
  const role = defineAgentTask({
    key,
    sandbox: await workbench(),
    request: () => ({ brief: { text: lines.join("\n") } }),
  });
  return (await role.perform(context)).text;
}

const verdict = defineJsonResponse({
  tag: "review",
  schema: z.object({ approved: z.boolean(), feedback: z.string() }),
});

export const tests = defineLoopTask({
  key: "tests",
  after: [review],
  maxRounds: 4,
  async attempt(context, feedback) {
    const summary = await ask(context, "test-writer", [
      `Ticket ${ticket.key}: ${ticket.text}`,
      "Write tests for these behaviors. Edit test files only and do not commit.",
      ...context.value(plan).tests.map((item) => `- ${item}`),
      feedback ? `Your last attempt was rejected:\n${feedback}` : "",
    ]);
    return { summary };
  },
  async check(context) {
    const files = await changedFiles(context);
    const outside = files.filter((file) => !isTest(file));
    if (!files.length) return { done: false, feedback: "No test changed." };
    if (outside.length)
      return { done: false, feedback: `Revert:\n${outside.join("\n")}` };
    const result = await run(context, "npm", "test");
    if (result.status === 0)
      return { done: false, feedback: "The tests already pass." };
    await commit(context, `test(${ticket.key}): ${ticket.text}`);
    return { done: true };
  },
});

export const code = defineLoopTask({
  key: "code",
  after: [tests],
  maxRounds: 6,
  async attempt(context, feedback) {
    const summary = await ask(context, "developer", [
      `Ticket ${ticket.key}: ${ticket.text}`,
      "Make the failing tests pass. Do not edit tests and do not commit.",
      ...context.value(plan).code.map((item) => `- ${item}`),
      feedback ? `Your last attempt was rejected:\n${feedback}` : "",
    ]);
    return { summary };
  },
  async check(context) {
    const edited = (await changedFiles(context)).filter(isTest);
    if (edited.length)
      return { done: false, feedback: `Revert:\n${edited.join("\n")}` };
    const result = await run(context, "npm", "test");
    if (result.status !== 0)
      return { done: false, feedback: `${result.stdout}\n${result.stderr}` };
    const reviewing = defineAgentTask({
      key: "reviewer",
      sandbox: await workbench(),
      request: () => ({
        response: verdict,
        brief: {
          text: [
            `Review the uncommitted changes for ${ticket.key} against this plan:`,
            ...context.value(plan).code.map((item) => `- ${item}`),
            'End with <review>{"approved": false, "feedback": "What to change"}</review>.',
          ].join("\n"),
        },
      }),
    });
    const { value } = await reviewing.perform(context);
    if (!value.approved) return { done: false, feedback: value.feedback };
    await commit(context, `feat(${ticket.key}): ${ticket.text}`);
    return { done: true };
  },
});
```

```ts title="run.ts"
import {
  createLocalTransport,
  createWorkflowCheckpointStore,
  defineWorkflow,
} from "@elie-laloum/outpost";
import type { WorkflowResult } from "@elie-laloum/outpost";
import { branch, closeWorkbench, code, tests } from "./delivery.ts";
import { frame, plan, review, ticket } from "./framing.ts";
import { repository } from "./outpost.config.mts";

const workflow = defineWorkflow("develop", [frame, plan, review, tests, code]);
const checkpoint = {
  store: createWorkflowCheckpointStore({
    transporter: createLocalTransport({
      directory: `${repository}/.outpost/storage`,
    }),
  }),
  runId: ticket.key,
  version: "1",
};

async function start(options: Parameters<typeof workflow.start>[0] = {}) {
  try {
    return view(await workflow.start({ ...options, checkpoint }));
  } finally {
    await closeWorkbench();
  }
}

function view(result: WorkflowResult) {
  if (result.status === "waiting-input")
    return { questions: result.inputRequests };
  if (result.status === "paused") return { plan: result.value(plan) };
  result.unwrap();
  return { branch, summary: result.value(code).summary };
}

// Starts the run, or reports what it waits for.
export const progress = () => start();

// `actor` comes from your authenticated session, never from the form.
export async function answer(actor: string, requestId: string, value: string) {
  const { inputRequests } = await workflow.start({ checkpoint });
  const request = inputRequests.find((pending) => pending.id === requestId);
  if (!request) throw new Error("This question is no longer pending");
  const { executionId, key } = request;
  return start({ answers: [{ executionId, key, requestId, actor, value }] });
}

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

Your application renders `questions` in a form and `plan` on a review page. Each call rebuilds the same workflow and checkpoint, so it can run in any process on the machine that holds the repository.

## How it works

Each link shows who hands what to whom, in the direction of the arrow.

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

## Adapt it

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
