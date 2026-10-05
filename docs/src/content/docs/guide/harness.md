---
title: "Build your own agent loop"
description: "Use Outpost’s built-in harness with a model provider, tools and explicit limits."
---

## Choose the built-in loop

Choose the built-in harness when you want to control the agent’s model API, tools and execution rules yourself. The loop runs in your Node.js process, while its tools act in the task’s sandbox.

|                 | CLI agent                                   | Built-in harness                                      |
| --------------- | ------------------------------------------- | ----------------------------------------------------- |
| Loop runs       | In the sandbox, as the CLI process          | In your Node.js process                               |
| Tools           | The CLI’s own                               | Only those you pass to `tools`                        |
| Model access    | Account login or API key                    | An API key on a [model provider](../model-providers/) |
| Sandbox image   | Contains the CLI, or installs it at startup | No agent CLI to install                               |
| Control         | CLI settings                                | Permissions, hooks and limits per call, and subagents |
| Usage reporting | Depends on the CLI                          | After each model response                             |

[Choose an agent](../choose-an-agent/) compares every capability.

## Run a task

`createHarness()` configures the loop; `createAgent()` pairs it with a model. The agent then goes to `dispatch()` like any other.

<!-- tabs -->

```ts title="review-model.ts"
import { createAnthropicModelProvider } from "@elie-laloum/outpost";

export const modelProvider = createAnthropicModelProvider({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});
```

```ts title="review-agent.ts"
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
  createHarnessSearchTools,
} from "@elie-laloum/outpost";
import { modelProvider } from "./review-model.ts";

export const reviewer = createAgent({
  model: { name: "claude-sonnet-5-5", maxOutputTokens: 16_000 },
  harness: createHarness({
    modelProvider: modelProvider,
    instructions: "Inspect the repository and answer with evidence.",
    tools: [createHarnessFileTools(), createHarnessSearchTools()],
  }),
});
```

```ts title="harness-review.ts"
import { dispatch } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { reviewer } from "./review-agent.ts";

export const result = await dispatch({
  repository,
  sandboxProvider,
  agent: reviewer,
  brief: { text: "List the exported functions that no test calls." },
});
console.log(result.text);
console.log(result.usage);
```

Set `ANTHROPIC_API_KEY`, then run `node harness-review.ts`. `result.text` holds the model’s final answer. These tools only read files, so the agent cannot edit the repository.

## The loop at a glance

<!-- canvas -->

- **Start the turn**: Once per brief, pass or repair.
  - Steps
  - **Build the system prompt**: Resolve `instructions` and the skill catalog.
    - host
  - **Start MCP servers**: Declared `mcpServers` start and add their tools.
    - sandbox
  - → **Run a step**: then
- **Run a step**: Repeated until the model answers without tool calls.
  - Steps
  - **Request the model**: Send the history, the system prompt and the tool list.
    - host
  - **Check the calls**: Validate each input against its schema, then apply permissions and `before-tool` hooks.
    - host
  - **Run the tools**: Consecutive read-only calls run in parallel, the others one at a time.
    - sandbox
  - **Return the results**: Results and tool errors join the history for the next step.
    - host
  - → **Finish**: then
- **Finish**: The model answers.
  - Steps
  - **Return the answer**: The final text becomes `result.text`, unless a `stop` hook or a steering message sends the model back to work.
    - host

Outpost checks the limits before every step and after each model response. The first one reached ends the turn with an [`OutpostError`](../error-handling/).

## Limit a model turn

`limits` bounds the loop; `toolExecution` sets how tool calls run.

```ts
import {
  createAnthropicModelProvider,
  createHarness,
  createHarnessShellTools,
} from "@elie-laloum/outpost";

const harness = createHarness({
  modelProvider: createAnthropicModelProvider({
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
  }),
  tools: [createHarnessShellTools()],
  limits: { maxSteps: 30, maxToolCalls: 60, usage: { output: 20_000 } },
  toolExecution: { deadlineMs: 60_000, onError: "fail" },
});
```

API reference: [HarnessLimits](../../reference/harnesslimits/) and [HarnessToolExecution](../../reference/harnesstoolexecution/).

With the default `onError`, a failed or expired call goes back to the model as an error result, and the loop continues. `usage` counts subagents and context summaries, and requires a model provider that reports usage completely.

### Dispatch deadlines

`deadlineMs` and `idleMs` on `dispatch()` also bound each harness turn: its total duration, and the silence between loop events. A running tool call pauses the idle timer; `toolExecution.deadlineMs` bounds it instead. See [Limits and cancellation](../limits-and-cancellation/).

## Observe the loop

API reference: [AgentObservation](../../reference/agentobservation/).

Watch tool calls and model requests while the harness runs. This example enables verbose observation so the callback can inspect the full model request.

<!-- tabs -->

```ts title="observed-model.ts"
import { createAnthropicModelProvider } from "@elie-laloum/outpost";

export const observedModel = createAnthropicModelProvider({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});
```

```ts title="observed-agent.ts"
import {
  createAgent,
  createHarness,
  createHarnessFileTools,
} from "@elie-laloum/outpost";
import { observedModel } from "./observed-model.ts";

export const agent = createAgent({
  model: { name: "claude-sonnet-5-5", maxOutputTokens: 16_000 },
  harness: createHarness({
    modelProvider: observedModel,
    tools: [createHarnessFileTools()],
  }),
});
```

```ts title="observe-harness.ts"
import { dispatch, createObservationHub } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { agent } from "./observed-agent.ts";

await dispatch({
  repository,
  sandboxProvider,
  agent,
  brief: { text: "Explain how the build is configured." },
  observation: createObservationHub({ verbose: true }),
  observe(event) {
    if (event.kind === "tool") console.log(event.name, event.input);
    if (event.kind === "model-request") console.dir(event.request);
  },
});
```

`tool-output` streams command output, correlated with its call by `callId`. Full `model-request` and `model-response` payloads exist only with a verbose [observation hub](../observability/). They hold the whole conversation, and the normal journal leaves them out.

## Go further

<!-- features -->

- [Model providers](../model-providers/): Connect an OpenAI-compatible or Anthropic API.
- [Tools](../harness-tools/): Give the model files, search, edits, Git, a shell or your own tools.
- [Permissions and hooks](../harness-permissions/): Allow, deny or rewrite tool calls before they run.
- [Subagents](../subagents/): Delegate part of a turn to a child agent in the same sandbox.
- [Context and skills](../harness-context/): Keep the history in bounds and load instructions on demand.
- [MCP servers](../mcp-servers/): Add the tools of Model Context Protocol servers.

## Limits

- Model access needs an API key, or a keyless local server. CLI account logins do not apply.
- Tool code runs in your process with your permissions. Only what it does through `context.sandbox` runs in the sandbox.
- Model requests leave from your process, so the sandbox’s [network restrictions](../network-restrictions/) do not apply to them.

API: [createHarness](../../reference/createharness/) · [HarnessOptions](../../reference/customharnessoptions/) · [HarnessLimits](../../reference/harnesslimits/) · [HarnessToolExecution](../../reference/harnesstoolexecution/) · [createAgent](../../reference/createagent/) · [createObservationHub](../../reference/createobservationhub/).
