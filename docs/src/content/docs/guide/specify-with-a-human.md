---
title: "Write a specification with a human"
description: "An agent questions the feature owner one question at a time, returns a JSON specification, and codes it on a branch once the owner approves."
---

A feature request is vague: “add a CSV export”. The agent asks its owner what it needs to know, one question at a time, and writes the answers into a JSON specification. The owner approves it, then a second task implements it on `outpost/csv-export`.

## What you use

<!-- features -->

- [Interactive tasks](../interactive-tasks/): The agent asks, waits for the answer, then continues its conversation.
  - `defineInteractiveAgentTask()`
- [Approvals](../approvals/): The owner approves the specification before any code is written.
  - `defineApprovalTask()`
- [Durable runs](../durable-runs/): A checkpoint keeps the questions and answers between processes.
  - `createWorkflowCheckpointStore()`
- [Tasks and dependencies](../task-dependencies/): The implementation starts after the approval and reads the specification.
  - `after`
  - `context.value()`
- [Repository and branch](../repository-and-branch/): The code lands on a named branch for review.
  - `named`
- [Write a brief](../briefs/): The specification becomes the implementation brief.

## The code

One file holds the workflow and the three functions your application calls. It sits next to the `outpost.config.mts` from [Setup](../setup/).

```ts title="specify.mts"
import {
  createLocalTransport,
  createWorkflowCheckpointStore,
  defineApprovalTask,
  defineInteractiveAgentTask,
  defineIsolatedTask,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import type { WorkflowResult } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const specify = defineInteractiveAgentTask({
  key: "specify",
  repository,
  agent: coder,
  sandboxProvider,
  brief: [
    "Specify a CSV export of the orders list with its owner.",
    "Read the code first, then ask about one open point at a time.",
    'When nothing is ambiguous, complete with {"summary": string, "requirements": string[], "acceptance": string[]}.',
  ].join("\n"),
  actors: ["owner"],
  maxTurns: 10,
});

const approval = defineApprovalTask({
  key: "approve",
  after: [specify],
  prompt: "Implement this specification?",
  actors: ["owner"],
});

const coding = defineIsolatedTask({
  key: "coding",
  request: (context) => ({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/csv-export" },
    brief: {
      text: `Implement this specification, test it and commit:\n${JSON.stringify(context.value(specify).output)}`,
    },
  }),
});

const implement = defineTask({
  key: "implement",
  after: [specify, approval],
  perform: async (context) => {
    const { branch, commits } = await coding.perform(context);
    return { branch, commits: commits.length };
  },
});

const workflow = defineWorkflow("csv-export", [specify, approval, implement]);
const checkpoint = {
  store: createWorkflowCheckpointStore({
    transporter: createLocalTransport({
      directory: `${repository}/.outpost/storage`,
    }),
  }),
  runId: "csv-export",
  version: "1",
};

function view(result: WorkflowResult) {
  if (result.status === "waiting-input")
    return { questions: result.inputRequests };
  if (result.status === "paused")
    return { specification: result.value(specify).output };
  result.unwrap();
  return { implemented: result.value(implement) };
}

// Starts the run, or reports what it waits for.
export async function progress() {
  return view(await workflow.start({ checkpoint }));
}

// `actor` comes from your authenticated session, never from the form.
export async function answer(actor: string, requestId: string, value: string) {
  const { inputRequests } = await workflow.start({ checkpoint });
  const request = inputRequests.find((pending) => pending.id === requestId);
  if (!request) throw new Error("This question is no longer pending");
  const { executionId, key } = request;
  return view(
    await workflow.start({
      checkpoint,
      answers: [{ executionId, key, requestId, actor, value }],
    }),
  );
}

export async function approve(actor: string, reason: string) {
  const current = await workflow.start({ checkpoint });
  const pending = current.tasks.find((task) => task.key === "approve")?.pause;
  if (!pending) throw new Error("No specification awaits approval");
  const decision = {
    executionId: current.executionId,
    key: "approve",
    requestId: pending.id,
    actor,
    reason,
    action: "approve" as const,
  };
  return view(await workflow.start({ checkpoint, decisions: [decision] }));
}
```

Your application renders `questions` in a form (`question`, and `choices` when the agent offers some) and `specification` on a review page. Each call rebuilds the same workflow and checkpoint, so it can run in any process on the machine that holds the repository.

## How it works

<!-- flow -->

1. **Ask**: `progress()` starts the run.
   - **First turn**: The agent reads the code in a sandbox and returns its first question.
     - sandbox
   - **Wait**: The sandbox closes and the question is saved; the run returns `waiting-input`.
     - `inputRequests`
2. **Answer**: Your form calls `answer()`, once per question.
   - **Check**: The request ID, the execution and the actor are validated before anything runs.
     - `WorkflowAnswer`
   - **Next turn**: A new sandbox resumes the conversation with the answer; the agent asks again or completes.
     - sandbox
3. **Approve**: The agent returns its JSON specification.
   - **Pause**: The `approve` gate stops the run; `progress()` returns the specification.
     - `paused`
   - **Decide**: `approve()` records the owner’s decision.
     - `defineApprovalTask()`
4. **Implement**: The approved run continues in the same call.
   - **Code**: A second agent implements the specification on `outpost/csv-export`.
     - `defineIsolatedTask()`
   - **Keep JSON**: `implement` saves the branch and the commit count, since checkpoints hold JSON only.
     - `defineTask()`

`answer()` and `approve()` return after the next agent turn, which can take minutes. From a web request, hand them to a [job queue worker](../job-queues/) instead of waiting.

:::caution
Outpost checks that `actor` is listed in `actors`; it does not know who filled in the form. Authenticate the user before you pass their actor name.
:::

## Adapt it

### Offer choices instead of free text

Ask for choices in the brief. With `"allowFreeText": false`, an answer must match one of `request.choices` exactly; render them as buttons.

```ts
const brief = [
  "Specify a CSV export of the orders list with its owner.",
  'When the options are known, ask with "choices" and "allowFreeText": false.',
].join("\n");
```

### Use another agent

The dialogue needs an agent that captures and resumes its conversation: Codex, Claude Code, Copilot CLI, Kimi Code or the [built-in harness](../harness/). Pass it as `agent` of `specify`; `coding` can keep `coder`.

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

const interviewer = createAgent({
  harness: createClaudeHarness({ authentication: "account" }),
});
```

### Notify the owner of a pending question

Send each question once `progress()` or `answer()` returns it: the request is already saved, and its `id` identifies the form to open.

```ts
import type { WorkflowInputRequest } from "@elie-laloum/outpost";

async function notifyOwner(
  questions: readonly WorkflowInputRequest[],
  send: (text: string) => Promise<void>,
) {
  for (const { id, question } of questions)
    await send(`${question}\nAnswer: https://example.com/specs/${id}`);
}
```

## Limits

- **One call at a time**: A second `start()` on the same run fails while one is active. After a crash, [recover ownership](../durable-runs/).
- **Same machine**: The repository, the dialogue’s worktree and its conversation must be reachable by the process that answers.
- **Turns**: `maxTurns` counts the final specification; a question on the last turn fails the task.
- **Resubmitting**: An answer already accepted is rejected as stale. After a lost response, call `progress()` before sending again.
- **Retained work**: Neither branch is merged. The dialogue keeps its worktree on an `outpost/interactive-…` branch; [clean it up](../retention/) when done.
- **Antigravity**: It cannot resume a conversation in a new sandbox, so `defineInteractiveAgentTask()` rejects it.

API: [defineInteractiveAgentTask](../../reference/defineinteractiveagenttask/) · [WorkflowInputRequest](../../reference/workflowinputrequest/) · [WorkflowAnswer](../../reference/workflowanswer/) · [defineApprovalTask](../../reference/defineapprovaltask/) · [defineIsolatedTask](../../reference/defineisolatedtask/).
