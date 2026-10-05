---
title: "Delegate to subagents"
description: "Give the built-in harness bounded child agents that share its sandbox."
---

## Expose a child agent as a tool

Declare a subagent with `defineHarnessSubagent()` and expose it as a tool of the parent harness. It borrows the parent’s sandbox but keeps its own conversation history, permissions and limits.

<!-- tabs -->

```ts title="model.ts"
import { createOpenAIModelProvider } from "@elie-laloum/outpost";

export const modelProvider = createOpenAIModelProvider({
  baseUrl: "https://api.openai.com/v1",
  api: "responses",
  apiKey: process.env.OPENAI_API_KEY ?? "",
});
export const model = process.env.MODEL_NAME ?? "";
```

```ts title="reviewer.ts"
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
} from "@elie-laloum/outpost";
import { model, modelProvider } from "./model.ts";

export const reviewer = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    instructions: "Inspect files and report findings. Do not edit files.",
    tools: [createHarnessFileTools()],
    limits: { maxSteps: 6, usage: { output: 2_000 } },
  }),
});
```

```ts title="delegation.ts"
import { defineHarnessSubagent } from "@elie-laloum/outpost";
import { reviewer } from "./reviewer.ts";

export const tools = [
  defineHarnessSubagent({
    name: "review",
    description: "Ask a reviewer to inspect repository files.",
    agent: reviewer,
  }),
];
```

```ts title="coordinator.ts"
import { createAgent, createHarness } from "@elie-laloum/outpost";
import { model, modelProvider } from "./model.ts";
import { tools } from "./delegation.ts";

export const coordinator = createAgent({
  model,
  harness: createHarness({
    modelProvider,
    tools,
    limits: { maxSteps: 8, maxDelegationDepth: 1, usage: { output: 5_000 } },
  }),
});
```

```ts title="run.ts"
import { reportValue } from "./reporter.ts";
import { dispatch } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { coordinator } from "./coordinator.ts";

export const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coordinator,
  brief: { text: "Have the validation code reviewed, then list the risks." },
});
reportValue(result.text);
// Example output: The reviewer found unchecked input in src/validation.ts.
```

The coordinator decides when to call `review`. Each call starts the reviewer with a fresh history; `result.text` holds the coordinator’s final answer and `result.usage` includes the reviewer’s tokens.

## What the parent sends and receives

<!-- canvas -->

- **Delegate**: The parent model calls the subagent tool.
  - Steps
  - **Send a prompt**: The only input is `{ "prompt": "…" }`.
  - **Start the child**: Its history holds its own instructions and that prompt, nothing from the parent.
    - host
  - → **Work**: then
- **Work**: The child runs its own loop.
  - Steps
  - **Use its tools**: Commands and edits run in the parent’s sandbox and worktree.
    - sandbox
  - **Count its tokens**: Usage adds up in the child, the parent and every ancestor.
  - → **Return**: then
- **Return**: The parent reads a tool result.
  - Steps
  - **Save the transcript**: The child conversation is captured, even after a failure.
    - host
  - **Answer the parent**: JSON text with `text`, the child’s final answer, and `conversation` when the child keeps one.

Children share the parent’s sandbox: they allocate no provider and open no workspace, so the parent sees their edits at once. Delegations run one at a time, even when the parent’s other tools run in parallel.

## Limit delegated work

Each loop keeps its own step and tool-call counts, while token budgets add up across descendants.

API reference: [HarnessLimits](../../reference/harnesslimits/).

A tool error goes back to the parent model, unless the parent sets `toolExecution: { onError: "fail" }`. Cancelling the dispatch also stops the child’s model requests and commands.

API reference: [HarnessLimits](../../reference/harnesslimits/) and [HarnessSubagentOptions](../../reference/harnesssubagentoptions/).

## Permissions and hooks

The parent’s and the child’s [permissions](../harness-permissions/) both apply to every child tool call, including inputs rewritten by a hook. Hooks run only in the harness that declares them: the parent’s hooks do not see the child’s tool calls.

## Resume a child conversation

The child’s transcript goes to its harness’s [conversation store](../conversations/) and records `parentConversation` and `parentCallId`. Pass its `conversation` ID as `continuation: { id }` to a `dispatch()` whose `agent` is the child to continue it on its own.

Resuming the parent does not run the child again: the parent replays the recorded tool results. Set `conversations: false` on the child harness to keep no child transcript.

## Follow and steer subagents

Each delegation emits a `subagent` event when it starts, finishes or fails. Every other event from the child, including `usage`, carries its run id in `subagentId`.

```ts
import { reportValue } from "./reporter.ts";
import type { DispatchOptions } from "@elie-laloum/outpost";

const observe: DispatchOptions["observe"] = (event) => {
  if (event.kind === "subagent")
    reportValue(event.name, event.status, event.id, event.conversation);
  // Example output: review started subagent-1 undefined
};
```

API reference: [AgentEvent](../../reference/agentevent/).

To send an instruction to a running child, pass its `id` as `subagent` to `steering.send()`. See [Steering a running agent](../steering/).

## Limits

- The child must be a built-in harness agent; `defineHarnessSubagent()` rejects CLI agents.
- Token budgets use reported usage: a response in flight can pass a ceiling before Outpost sees it. They are not prepaid spending caps.
- When you resume a parent whose delegation was interrupted, that call comes back to the model as a tool error. Outpost does not restart the child.
- A child cannot release the shared sandbox.

API: [defineHarnessSubagent](../../reference/defineharnesssubagent/) · [HarnessSubagentOptions](../../reference/harnesssubagentoptions/) · [HarnessLimits](../../reference/harnesslimits/) · [AgentEvent](../../reference/agentevent/).
