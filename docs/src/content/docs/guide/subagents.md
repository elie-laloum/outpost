---
title: "Subagents"
description: "Let a built-in agent delegate part of its turn to a child agent with its own instructions, tools and limits, in the same sandbox."
---

## Expose a child agent as a tool

`defineHarnessSubagent()` turns a [built-in harness](../harness/) agent into a tool that another built-in agent can call. Give it a `name`, a `description` that tells the parent when to delegate, and the child `agent`.

```ts
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
  createOpenAIModelProvider,
  defineHarnessSubagent,
  dispatch,
} from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

const modelProvider = createOpenAIModelProvider({
  baseUrl: "https://api.openai.com/v1",
  api: "responses",
  apiKey: process.env.OPENAI_API_KEY ?? "",
});
const model = process.env.MODEL_NAME ?? "";

const reviewer = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    instructions: "Inspect files and report findings. Do not edit files.",
    tools: [createHarnessFileTools()],
    limits: { maxSteps: 6, usage: { output: 2_000 } },
  }),
});

const coordinator = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    tools: [
      defineHarnessSubagent({
        name: "review",
        description: "Ask a reviewer to inspect repository files.",
        agent: reviewer,
      }),
    ],
    limits: { maxSteps: 8, maxDelegationDepth: 1, usage: { output: 5_000 } },
  }),
});

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coordinator,
  brief: { text: "Have the validation code reviewed, then list the risks." },
});
console.log(result.text);
```

The coordinator decides when to call `review`. Each call starts the reviewer with a fresh history; `result.text` holds the coordinator’s final answer and `result.usage` includes the reviewer’s tokens.

## What the parent sends and receives

<!-- flow -->

1. **Delegate**: The parent model calls the subagent tool.
   - **Send a prompt**: The only input is `{ "prompt": "…" }`.
   - **Start the child**: Its history holds its own instructions and that prompt, nothing from the parent.
     - host
2. **Work**: The child runs its own loop.
   - **Use its tools**: Commands and edits run in the parent’s sandbox and worktree.
     - sandbox
   - **Count its tokens**: Usage adds up in the child, the parent and every ancestor.
3. **Return**: The parent reads a tool result.
   - **Save the transcript**: The child conversation is captured, even after a failure.
     - host
   - **Answer the parent**: JSON text with `text`, the child’s final answer, and `conversation` when the child keeps one.

Children share the parent’s sandbox: they allocate no provider and open no workspace, so the parent sees their edits at once. Delegations run one at a time, even when the parent’s other tools run in parallel.

## Bound delegation

Each loop keeps its own step and tool-call counts, while token budgets add up across descendants.

| Limit                                                                      | Counts                                      | When it is reached                                 |
| -------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------- |
| `maxSteps`, `maxToolCalls`                                                 | Each loop separately.                       | The child stops; the parent receives a tool error. |
| `usage` on the child                                                       | The child and its own children.             | The child stops; the parent receives a tool error. |
| `usage` on an ancestor                                                     | That ancestor and all its descendants.      | That ancestor fails with code `limit`.             |
| `maxDelegationDepth`                                                       | Nesting levels below this harness.          | The delegating call returns a `limit` tool error.  |
| parent [`toolExecution.deadlineMs`](../../reference/harnesstoolexecution/) | One whole delegation; 5 minutes by default. | The child is cancelled; the parent gets a timeout. |

A tool error goes back to the parent model, unless the parent sets `toolExecution: { onError: "fail" }`. Cancelling the dispatch also stops the child’s model requests and commands.

`maxDelegationDepth` defaults to 3, and 0 disables delegation. A child’s own value can only tighten what its ancestors allow: with `maxDelegationDepth: 1` above, the reviewer cannot delegate further.

## Permissions and hooks

The parent’s and the child’s [permissions](../harness-permissions/) both apply to every child tool call, including inputs rewritten by a hook. Hooks run only in the harness that declares them: the parent’s hooks do not see the child’s tool calls.

## Resume a child conversation

The child’s transcript goes to its harness’s [conversation store](../conversations/) and records `parentConversation` and `parentCallId`. Pass its `conversation` ID as `continuation: { id }` to a `dispatch()` whose `agent` is the child to continue it on its own.

Resuming the parent does not run the child again: the parent replays the recorded tool results. Set `conversations: false` on the child harness to keep no child transcript.

## Follow and steer subagents

Each delegation emits a `subagent` event when it starts, finishes or fails. Every other event from the child, including `usage`, carries its run id in `subagentId`.

```ts
import type { DispatchOptions } from "@elie-laloum/outpost";

const observe: DispatchOptions["observe"] = (event) => {
  if (event.kind === "subagent")
    console.log(event.name, event.status, event.id, event.conversation);
};
```

| Field          | Holds                                         |
| -------------- | --------------------------------------------- |
| `id`           | This child run, unique per delegation.        |
| `callId`       | The parent’s tool call that started it.       |
| `name`         | The subagent tool name.                       |
| `status`       | `started`, `finished` or `failed`.            |
| `conversation` | The child conversation ID, when it keeps one. |

To send an instruction to a running child, pass its `id` as `subagent` to `steering.send()`. See [Steering a running agent](../steering/).

## Limits

- The child must be a built-in harness agent; `defineHarnessSubagent()` rejects CLI agents.
- Token budgets use reported usage: a response in flight can pass a ceiling before Outpost sees it. They are not prepaid spending caps.
- When you resume a parent whose delegation was interrupted, that call comes back to the model as a tool error. Outpost does not restart the child.
- A child cannot release the shared sandbox.

API: [defineHarnessSubagent](../../reference/defineharnesssubagent/) · [HarnessSubagentOptions](../../reference/harnesssubagentoptions/) · [HarnessLimits](../../reference/harnesslimits/) · [AgentEvent](../../reference/agentevent/).
