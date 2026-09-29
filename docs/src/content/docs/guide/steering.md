---
title: "Steering a running agent"
description: "Send an instruction to an agent that is already working."
---

Implemented, not yet released. `createSteering()` returns a controller that you pass to a dispatch as `steering`. While the dispatch runs, `send()` hands an instruction to its agent without cancelling the work.

```ts
import { createSandbox, createSteering } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
});
const steering = createSteering();
const running = sandbox.dispatch({
  brief: { text: "Refactor the auth module." },
  steering,
});
const delivery = await steering.send("Leave the legacy/ folder untouched.");
console.log(delivery.mode); // "injected" or "resumed"
const result = await running;
```

`send()` resolves when the agent receives the text, not when it has acted on it. The instruction does not replace the brief: the agent reads it as an additional user message.

## How the instruction reaches the agent

| Agent and sandbox                                                                                            | Delivery                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Built-in harness](../model-loop/)                                                                           | `injected`: added before the next model request, after the current tool results. If the model was about to finish, it continues with the instruction.                                           |
| [Claude Code](../claude-code/) on [Docker](../docker/), [Podman](../podman/) or the [host](../host-process/) | `injected`: written to Claude's stream-json input. Read during a tool call, it joins the running turn; read while Claude writes its final answer, it runs as a queued turn in the same process. |
| Codex, Copilot CLI, Kimi Code, Antigravity, and Claude Code on Vercel, Daytona or Firecracker                | `resumed`: Outpost stops the running process once its conversation is known, keeps the sandbox, then resumes the same conversation with the instruction. The action in progress is cut short.   |

Files the agent already changed stay in the workspace. With `resumed` delivery, the interrupted turn appears in `result.turns` with `interrupted: "steering"` and emits a `stopped` event with reason `steered`.

The agent CLIs decide this split. Claude Code accepts user messages on stdin while it works; `codex exec`, Copilot and Kimi prompt mode take a single prompt; Antigravity queues each stdin message as a separate turn. Vercel, Daytona and Firecracker stage stdin before the command starts.

## Timing

- **Before the turn starts.** Messages sent before the dispatch reaches its agent are appended to the prompt.
- **During the turn.** Delivered as described above.
- **After the agent answered.** Outpost resumes the conversation in a new turn of the same pass, so the result always reflects the last instruction. This applies to every agent that can resume, including the built-in harness and Claude Code.

A message the dispatch cannot deliver is rejected when the dispatch ends: for example an agent that stopped without reporting a conversation. The rejection is an `OutpostError` with code `steering` and the text in `details.text`.

## Lifecycle

A controller serves one dispatch at a time and can be reused for the next one. Attaching it to a second concurrent dispatch fails. Messages sent while no dispatch runs wait for the next dispatch that uses the controller; `close()` rejects them and every later `send()`.

`dispatch()` shares one controller across its passes. `result.resume()` and `result.fork()` do not reuse it: pass `steering` again. In a workflow, return it from the `request` of an [`agentTask` or `isolatedTask`](../task-dependencies/).

Before running, a dispatch rejects agents that can neither receive live input nor resume a conversation: [replay agents](../record-replay/) and adapters with `resumable: false`. Candidates of a [fallback agent](../agent-fallback/) are validated the same way, and steering follows the candidate that is running.

## Events, history and usage

Each delivery emits a `steer` [agent event](../live-events/) with `text`, `mode` and `pass`; the terminal reporter prints it. Harness transcripts and Claude Code sessions record the instruction as a user message. A pass still emits one `summary`, and `result.usage` includes interrupted turns.

## Limits

- Instructions live in memory. For questions and answers that must survive a restart, use [interactive tasks](../interactive-tasks/).
- Built-in [subagents](../model-loop/) do not receive steering; only the top-level loop does.
- Replaying a journal of a steered run diverges at the resumed prompt.
- Claude Code injection was checked once against Claude Code 2.1.282. Interruption and resumption for Codex, Copilot, Kimi and Antigravity are covered by deterministic tests with simulated CLIs and a real Docker sandbox, not by live runs.

API: [createSteering](../../reference/createsteering/) · [Steering](../../reference/steering/) · [SteeringDelivery](../../reference/steeringdelivery/) · [DispatchOptions](../../reference/dispatchoptions/).
