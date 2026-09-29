---
title: "Interactive tasks"
description: "Persist a question, release the sandbox and continue the conversation after a human answer."
---

Available since 8.0.0. `defineInteractiveAgentTask()` keeps one workflow task unfinished across several question/answer turns. A question ends the agent turn, captures its conversation and returns `waiting-input`; dependent tasks remain blocked. A later `start({ answers })` resumes the conversation, and the next question can depend on previous answers.

Unlike [review gates](../approvals/), questions are generated during execution. This is a dialogue between completed agent turns, not suspension inside a running tool or an interactive terminal.

## Define the dialogue

Use an agent and provider from [Setup](../setup/). Both the Outpost `createHarness()` and CLI presets with portable conversation capture and resume use the same structured-response protocol. Codex, Claude Code, Copilot and Kimi are admitted with capture enabled. Antigravity and disabled conversation storage/capture are rejected before allocation. Synthetic adapter tests establish the protocol, not live compatibility with every CLI/model combination.

```ts
import {
  defineInteractiveAgentTask,
  createLocalTransport,
  defineWorkflow,
  createWorkflowCheckpointStore,
} from "@elie-laloum/outpost";
import type { Agent, SandboxProvider } from "@elie-laloum/outpost";

function discovery(
  repository: string,
  assistant: Agent,
  sandboxProvider: SandboxProvider,
) {
  const clarify = defineInteractiveAgentTask({
    key: "clarify",
    repository,
    agent: assistant,
    sandboxProvider,
    brief:
      "Define the application with the user, then return its specification.",
    actors: ["owner"],
    maxTurns: 12,
    timeoutMs: 120_000,
  });
  const pipeline = defineWorkflow("discovery", [clarify]);
  const checkpoint = {
    store: createWorkflowCheckpointStore({
      transporter: createLocalTransport({
        directory: `${repository}/.outpost/storage`,
      }),
    }),
    runId: "discovery-42",
    version: "1",
  };
  return { clarify, pipeline, checkpoint };
}
```

Call `pipeline.start({ checkpoint })`. Render `result.inputRequests` in your application; every request contains `id`, `executionId`, task `key`, `question` and optional `choices`/`allowFreeText`. Free text is allowed by default. When it is false, the answer must exactly match one of the choices. There can be several pending questions from independent tasks.

Outpost supplies the agent with a response protocol: `<interaction>{"kind":"question","question":"…"}</interaction>` or `<interaction>{"kind":"completed","output":…}</interaction>`. The final output must be lossless JSON. Invalid responses get at most one repair request within that turn. No extra `ask_user` tool is required.

## Accept an answer

Authenticate the respondent in your application, then supply its authorized actor identifier. Actor names are trusted application metadata; answers do not have signed-gate verification. Keep the workflow definition, checkpoint run ID and version stable when reconstructing them in another process.

```ts
import type {
  Workflow,
  WorkflowCheckpointOptions,
  WorkflowInputRequest,
} from "@elie-laloum/outpost";

async function answerQuestion(
  pipeline: Workflow,
  checkpoint: WorkflowCheckpointOptions,
  pending: WorkflowInputRequest,
  authenticatedActor: string,
  answer: string,
) {
  return pipeline.start({
    checkpoint,
    answers: [
      {
        executionId: pending.executionId,
        key: pending.key,
        requestId: pending.id,
        actor: authenticatedActor,
        value: answer,
      },
    ],
  });
}
```

All answers are validated before any are applied. Accepted answers are persisted before starting another agent turn. Stale IDs, unauthorized actors, wrong executions, duplicate submissions and invalid choices are rejected. A retry after a lost HTTP response must inspect the latest checkpoint/result before submitting again; answer submission is not an idempotent HTTP endpoint. Checkpoint ownership fences concurrent coordinators and requires [explicit recovery](../durable-runs/) after a crash.

Calling `start()` without answers leaves pending questions intact and does not call the model again. After answering, render any new `inputRequests`. Once the task succeeds, `result.value(clarify)` contains `output`, `conversation`, `branch`, `directory` and `turns`; it contains no live sandbox or continuation methods. `unwrap()` still throws while a workflow is waiting. In a mixed workflow, `waiting-input` takes precedence over approval `paused`; inspect task records for both kinds of pending work. Failures and cancellation take precedence over waits.

## Ownership, limits and recovery

Each executing turn allocates a sandbox and closes it before publishing its question. The named Git worktree is preserved, including uncommitted files. Outpost does not integrate, push or delete this workspace after completion; review and integrate it explicitly, then clean up retained resources when they are no longer needed. Sandbox home files and running processes are not preserved between turns; keep required project files in the worktree.

The repository, retained worktree and captured conversation store must remain accessible to the next runner. A remote checkpoint does not make local Git or transcripts portable. Missing or detached worktrees are rejected rather than silently restarting the dialogue. Remote providers use the existing upload and synchronization contracts, including protection against concurrent host edits; provider-specific live validation is still required.

`maxTurns` defaults to 12 and includes the final result. A question on the last allowed turn fails rather than creating an unanswerable wait. Workflow attempts and token usage remain cumulative across calls; response repairs also count toward usage. Task and workflow deadlines apply to executing calls, not time between them. An abort stops an executing turn; it does not delete an already persisted pending request. There is no pending-question expiration or answer-signing API in this first implementation.

A crash during a turn may leave effects in the workspace or an external service. Recovery requires `checkpoint.resume: "retry-incomplete"` to authorize replay of that unfinished turn; completed dependencies are retained. Already checkpointed completed dialogue output is reused without another model call. This does not guarantee exactly-once tool effects or restore an interrupted JavaScript stack. Change the checkpoint version/run ID when implementations or provider configuration change; agent name/model, brief, repository, actor list and turn limit already participate in compatibility checks.

For custom workflow operations, `defineTask({ interaction: { identity, actors }, perform })` exposes `context.interaction.state`, `.answer`, `.save(state)` and `.suspend(question, state)`. Save only lossless JSON. The callback starts again on each answer and must use its state to avoid repeating completed work. Do not swallow the suspension signal or issue multiple concurrent suspension operations. `defineInteractiveAgentTask()` implements this continuation discipline for agent conversations.

API: [defineInteractiveAgentTask](../../reference/defineinteractiveagenttask/) · [InteractiveAgentTaskOptions](../../reference/interactiveagenttaskoptions/) · [WorkflowInputRequest](../../reference/workflowinputrequest/) · [WorkflowAnswer](../../reference/workflowanswer/).
