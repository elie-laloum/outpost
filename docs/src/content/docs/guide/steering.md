---
title: "Send instructions during a task"
description: "Give a running agent a new instruction and track how it is delivered."
---

## Send an instruction

Create a steering controller and pass it to the dispatch. While the task runs, `send()` submits another instruction and resolves when Outpost can report how it was delivered.

```ts
import { createSteering, dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const steering = createSteering();
const running = dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/auth-refactor" },
  brief: { text: "Refactor the auth module." },
  steering,
});
const delivery = await steering.send("Leave the legacy/ folder untouched.");
console.log(delivery.mode); // "injected" or "resumed"
const result = await running;
```

`send()` resolves when the agent receives the text, not when it has acted on it. The agent reads it as one more user message; the brief still applies.

## How it reaches each agent

| Agent                                                                                      | `mode`     | What happens                                                                                                                   |
| ------------------------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [Built-in harness](../harness/)                                                            | `injected` | Added to the next model request, after the current tool results. A model about to finish continues instead.                    |
| [Claude Code](../claude-code/)                                                             | `injected` | Written to its stream-json input. It joins the running turn, or runs next in the same process if Claude was already answering. |
| [Codex](../codex/)                                                                         | `injected` | A steered dispatch runs `codex app-server`. `turn/steer` adds the text to the active turn, or starts the next one.             |
| [Copilot CLI](../copilot-cli/), [Kimi Code](../kimi-code/), [Antigravity](../antigravity/) | `resumed`  | Outpost stops the process once its conversation is known, then resumes it with the text in the same sandbox.                   |

With `resumed`, the action in progress is cut short, but files already changed stay in the workspace. Every sandbox provider carries live input; on Vercel and Daytona each instruction costs one provider command and arrives a moment later.

## When you send it

| You send it                           | What happens                                                               | `mode`                 |
| ------------------------------------- | -------------------------------------------------------------------------- | ---------------------- |
| Before the agent starts               | Appended to the prompt.                                                    | `injected`             |
| During the turn                       | Delivered as in the table above.                                           | `injected` / `resumed` |
| After the agent answered              | Outpost resumes the conversation in a new turn, so the result reflects it. | `resumed`              |
| While no dispatch uses the controller | Waits for the next dispatch that receives the controller.                  | ―                      |

An instruction the dispatch cannot deliver, for example because the agent never reported a conversation, is rejected when the dispatch ends. The rejection is an [`OutpostError`](../error-handling/) with code `steering` and the text in `details.text`.

## Target a built-in subagent

Each [built-in subagent](../subagents/) run has an id, reported by its `subagent` event. Pass it as `subagent` to reach that run only.

```ts
import { createSteering, type DispatchOptions } from "@elie-laloum/outpost";

const steering = createSteering();
const request: DispatchOptions = {
  brief: { text: "Review the repository." },
  steering,
  observe(event) {
    if (event.kind !== "subagent" || event.status !== "started") return;
    if (event.name === "inspect")
      void steering.send("Only inspect src/.", { subagent: event.id });
  },
};
```

API reference: [SteeringSendOptions](../../reference/steeringsendoptions/).

An instruction still waiting when its run ends is rejected with code `steering` and the run id in `details.subagent`.

## Reuse the controller

A controller serves one dispatch at a time, across all its passes; attaching it to a second concurrent dispatch fails. Once a dispatch ends, the next one can use it. `close()` rejects pending instructions and every later `send()`.

`result.resume()` and `result.fork()` do not inherit it: pass `steering` again in their options.

In a workflow, return `steering` from the `request` of a [`defineAgentTask()` or `defineIsolatedTask()`](../task-dependencies/). With a [fallback agent](../fallback-agents/), steering follows the candidate that runs.

## Events and usage

Each delivery emits a `steer` [agent event](../progress/) with `text`, `mode`, `pass`, and `subagentId` when a subagent received it. The terminal reporter prints it, and the conversation records it as a user message.

A `resumed` delivery ends the interrupted turn with a `stopped` event of reason `steered`; that turn appears in `result.turns` with `interrupted: "steering"`. A pass still emits one `summary`, and `result.usage` includes interrupted turns. A [replay](../record-replay/) reproduces steered runs turn by turn.

## Limits

- Instructions live in memory. For questions and answers that must survive a restart, use [interactive tasks](../interactive-tasks/).
- A dispatch with `steering` rejects agents that can neither take live input nor resume a conversation, including [replay agents](../record-replay/).
- Codex steering uses the `app-server` protocol, which Codex marks experimental.
- Subagents of CLI agents cannot be addressed: an instruction with `subagent` is rejected as soon as a CLI turn sees it.

API: [createSteering](../../reference/createsteering/) · [Steering](../../reference/steering/) · [SteeringSendOptions](../../reference/steeringsendoptions/) · [SteeringDelivery](../../reference/steeringdelivery/) · [DispatchOptions](../../reference/dispatchoptions/).
