---
title: "Let an agent ask questions"
description: "Pause an agent task for a human answer and continue the saved conversation."
---

## Interactive task or approval gate?

Use an interactive task when the agent needs to ask a person for information before continuing. Use an approval task when your workflow needs permission to proceed. These two pauses have different inputs and resume rules.

|                   | Interactive task                                 | Approval gate                               |
| ----------------- | ------------------------------------------------ | ------------------------------------------- |
| Question          | Written by the agent, adapted to earlier answers | The fixed `prompt` of the gate              |
| Answer            | Free text, or one of the agent’s `choices`       | `approve` or `reject`                       |
| What it continues | The agent’s conversation, in a new turn          | The tasks that depend on the gate           |
| Submitted with    | `start({ answers })`                             | `start({ decisions })`                      |
| Signed proofs     | No                                               | Optional, with `authentication: "signed"`   |
| Definition        | `defineInteractiveAgentTask()`                   | `defineApprovalTask()`, `definePauseTask()` |

## Define the dialogue

The task needs a checkpoint: it stores the questions and answers between processes.

<!-- tabs -->

```ts title="clarify.ts"
import { defineInteractiveAgentTask } from "@elie-laloum/outpost";
import { repository, coder, sandboxProvider } from "./outpost.config.ts";

export const clarify = defineInteractiveAgentTask({
  key: "clarify",
  repository,
  agent: coder,
  sandboxProvider,
  brief:
    'Define the application with its owner, then complete with {"summary": string, "features": string[]}.',
  actors: ["owner"],
});
```

```ts title="question-store.ts"
import {
  createWorkflowCheckpointStore,
  createLocalTransport,
} from "@elie-laloum/outpost";

export const store = createWorkflowCheckpointStore({
  transporter: createLocalTransport({ directory: ".outpost/storage" }),
});
```

```ts title="start.ts"
import { reportValue } from "./reporter.ts";
import { defineWorkflow } from "@elie-laloum/outpost";
import { clarify } from "./clarify.ts";
import { store } from "./question-store.ts";

export const workflow = defineWorkflow("discovery", [clarify]);
export const checkpoint = { store, runId: "discovery-42", version: "1" };
export const result = await workflow.start({ checkpoint });
reportValue(result.status, result.inputRequests[0]?.question);
// Example output: waiting-input What should the new endpoint return?
```

It prints `waiting-input` and the agent’s first question. Outpost adds the question protocol to your brief, so the brief only describes the goal and the shape of the final JSON.

API reference: [InteractiveAgentTaskOptions](../../reference/interactiveagenttaskoptions/).

Codex, Claude Code, Copilot CLI, Kimi Code and the [built-in harness](../harness/) are accepted. Antigravity, and a harness created with `conversations: false`, are rejected when the task is defined: see [Conversations](../conversations/).

## How the dialogue runs

<!-- canvas -->

- **Turn**: The agent works in a fresh sandbox.
  - Steps
  - **Run**: It continues its conversation with the brief or the latest answer.
    - sandbox
  - **Close**: Outpost saves the conversation and closes the sandbox.
    - host
  - → **Question**: then
- **Question**: The run stops with `waiting-input`.
  - Steps
  - **Save**: The checkpoint stores the question; dependent tasks wait.
    - `inputRequests`
  - → **Answer**: then
- **Answer**: Your application submits it.
  - Steps
  - **Validate**: Outpost checks and saves the answer, then starts the next turn.
    - `start({ answers })`
  - → **Output**: then
- **Output**: The agent completes with JSON instead of asking.
  - Steps
  - **Keep**: The checkpoint stores the output.
    - `result.value()`

## Show the questions

`result.inputRequests` lists every pending question. Independent interactive tasks can wait at the same time.

API reference: [WorkflowInputRequest](../../reference/workflowinputrequest/).

:::caution
Notify people from `result.inputRequests` once `start()` returns. The `input-request` [workflow event](../progress/) fires before the checkpoint write and carries only the task key.
:::

## Accept an answer

Restart the same workflow with the same checkpoint and an `answers` entry per request.

<!-- tabs -->

```ts title="answer-value.ts"
import type { WorkflowInputRequest } from "@elie-laloum/outpost";

export function answerValue(
  request: WorkflowInputRequest,
  actor: string,
  value: string,
) {
  return {
    executionId: request.executionId,
    key: request.key,
    requestId: request.id,
    actor,
    value,
  };
}
```

```ts title="answer.ts"
import type {
  Workflow,
  WorkflowCheckpointOptions,
  WorkflowInputRequest,
} from "@elie-laloum/outpost";
import { answerValue } from "./answer-value.ts";

export async function answer(
  workflow: Workflow,
  checkpoint: WorkflowCheckpointOptions,
  request: WorkflowInputRequest,
  actor: string,
  value: string,
) {
  return workflow.start({
    checkpoint,
    answers: [answerValue(request, actor, value)],
  });
}
```

`start()` runs the next turn and returns at the next question or once the task ends. Called without `answers`, it returns the pending questions without calling the model.

Outpost checks every answer before applying any. It rejects a stale `requestId`, an actor outside `actors`, another execution, a second answer for the same task and, when `allowFreeText` is `false`, a value outside `choices`.

:::caution
Submitting is not idempotent. After a lost HTTP response, call `start({ checkpoint })` to read the current request before sending again. Actors are trusted metadata: authenticate the person first, as for [approvals](../approvals/).
:::

## Read the result

Read the completed dialogue with `result.value(clarify)`.

API reference: [InteractiveAgentResult](../../reference/interactiveagentresult/).

`result.usage` adds up the attempts and tokens of every turn, repairs included. `unwrap()` throws while the run waits. In a workflow that also has gates, `waiting-input` wins over `paused`, and a failure or cancellation wins over both.

## Keep the workspace

Each turn opens a sandbox and closes it before the question is published. Files in the worktree carry over between turns, committed or not; the sandbox home and running processes do not.

Outpost never integrates, pushes or deletes the worktree. Review `branch` and merge it yourself ([Repository and branch](../repository-and-branch/)), then prune it with [Retention and cleanup](../retention/).

The repository, the worktree and the conversation store must stay at the same paths for the next process. A moved worktree fails with `Interactive workspace moved; recover it explicitly`, and a switched branch with `Interactive workspace branch changed; recover it explicitly`.

## Recover after a crash

A crash during a turn leaves the task incomplete, and the next `start()` refuses to replay it. Authorize the replay with `checkpoint: { ...checkpoint, resume: "retry-incomplete" }`.

The turn restarts from the last saved conversation and answer; a completed output is reused without calling the model. Partial effects of the interrupted turn may repeat. [Durable runs](../durable-runs/) covers replay and recovering the checkpoint’s ownership.

## Write a custom interactive task

`defineTask()` with `interaction` suspends any task on a question. `defineInteractiveAgentTask()` is built on it.

```ts
import { defineTask } from "@elie-laloum/outpost";

const region = defineTask({
  key: "region",
  interaction: { identity: "region-v1", actors: ["owner"] },
  perform: (context) => {
    const interaction = context.interaction;
    if (!interaction) throw new Error("Run with a checkpoint");
    const answer = interaction.answer;
    if (!answer)
      return interaction.suspend(
        { question: "Deploy to which region?", choices: ["eu", "us"] },
        { step: "region" },
      );
    return { region: answer.value };
  },
});
```

`perform` runs again from the start after each answer. Read `interaction.state` to skip finished work, and `save(state)` to record progress; both hold JSON only.

## Limits

- A question on the last of `maxTurns` fails the task instead of waiting.
- Questions do not expire, and answers are not signed.
- Cancelling stops a running turn; a question already saved stays pending.
- Changing the agent, model, brief, repository, provider, actors or `maxTurns` makes the saved checkpoint incompatible: start a new `runId`.

A complete scenario with an approval, red tests and reviewed code: [Build a development workflow](../development-workflow/).

API: [defineInteractiveAgentTask](../../reference/defineinteractiveagenttask/) · [InteractiveAgentTaskOptions](../../reference/interactiveagenttaskoptions/) · [InteractiveAgentResult](../../reference/interactiveagentresult/) · [WorkflowInputRequest](../../reference/workflowinputrequest/) · [WorkflowAnswer](../../reference/workflowanswer/) · [TaskInteractionContext](../../reference/taskinteractioncontext/)
