---
title: "Steering a running agent"
description: "Send an instruction to an agent that is already working."
---

`createSteering()` returns a controller that you pass to a dispatch as `steering`. While the dispatch runs, `send()` hands an instruction to its agent without cancelling the work.

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

| Agent                               | Delivery                                                                                                                                                                                                  |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Built-in harness](../harness/)     | `injected`: added before the next model request, after the current tool results. If the model was about to finish, it continues. While a built-in subagent works, that subagent receives the instruction. |
| [Claude Code](../claude-code/)      | `injected`: written to Claude's stream-json input. Read during a tool call, it joins the running turn; read while Claude writes its final answer, it runs as a queued turn in the same process.           |
| [Codex](../codex/)                  | `injected`: Codex runs as `codex app-server` for steered dispatches and receives the instruction with `turn/steer` in the active turn. When no turn is active, it starts the next turn of the thread.     |
| Copilot CLI, Kimi Code, Antigravity | `resumed`: Outpost stops the running process once its conversation is known, keeps the sandbox, then resumes the same conversation with the instruction. The action in progress is cut short.             |

Every provider accepts live input: local, Docker and Podman pipe stdin, Firecracker forwards it through SSH, and Vercel and Daytona append framed chunks to a file that a small Node wrapper in the sandbox feeds to the agent. On Vercel and Daytona each instruction costs one provider command, so it arrives about one to two seconds later.

Files the agent already changed stay in the workspace. With `resumed` delivery, the interrupted turn appears in `result.turns` with `interrupted: "steering"` and emits a `stopped` event with reason `steered`.

The agent CLIs decide this split: `copilot -p` and `kimi --prompt` take a single prompt, and Antigravity queues each stdin message as a separate turn.

## Target a subagent

Each [built-in subagent](../harness/) delegation has a run id, reported by its `subagent` event and carried as `subagentId` by its other events. Pass it to `send()` to address that run:

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

| `subagent` option | Receiver                                                                      |
| ----------------- | ----------------------------------------------------------------------------- |
| omitted           | The first active loop to reach a step boundary: the working subagent, if any. |
| a run id          | Only that subagent run, at any depth.                                         |
| `null`            | Only the main loop, after the current delegation returns.                     |

An instruction still addressed to a run when it ends is rejected with code `steering` and the run id in `details.subagent`. CLI agents cannot address their own subagents: a targeted instruction is rejected as soon as a CLI turn sees it.

## Timing

- **Before the turn starts.** Messages sent before the dispatch reaches its agent are appended to the prompt.
- **During the turn.** Delivered as described above.
- **After the agent answered.** Outpost resumes the conversation in a new turn of the same pass, so the result always reflects the last instruction. This applies to every agent that can resume, including the built-in harness and Claude Code.

A message the dispatch cannot deliver is rejected when the dispatch ends: for example an agent that stopped without reporting a conversation. The rejection is an `OutpostError` with code `steering` and the text in `details.text`.

## Lifecycle

A controller serves one dispatch at a time and can be reused for the next one. Attaching it to a second concurrent dispatch fails. Messages sent while no dispatch runs wait for the next dispatch that uses the controller; `close()` rejects them and every later `send()`.

`dispatch()` shares one controller across its passes. `result.resume()` and `result.fork()` do not reuse it: pass `steering` again. In a workflow, return it from the `request` of an [`defineAgentTask` or `defineIsolatedTask`](../task-dependencies/).

Before running, a dispatch rejects agents that can neither receive live input nor resume a conversation: [replay agents](../record-replay/) and adapters with `resumable: false`. Candidates of a [fallback agent](../fallback-agents/) are validated the same way, and steering follows the candidate that is running.

## Events, history and usage

Each delivery emits a `steer` [agent event](../progress/) with `text`, `mode` and `pass`, and `subagentId` when a subagent received it; the terminal reporter prints it. Harness transcripts and native sessions record the instruction as a user message. A pass still emits one `summary`, and `result.usage` includes interrupted turns.

A [replay](../record-replay/) of a steered run reproduces its turns: each `resumed` instruction starts the next recorded turn, and the interrupted turn keeps `interrupted: "steering"`, its own text and usage.

## Limits

- Instructions live in memory. For questions and answers that must survive a restart, use [interactive tasks](../interactive-tasks/).
- When several subagents run at once, an instruction without a target goes to the first one that reaches a step boundary; pass a run id to choose.
- Codex steering uses the `app-server` protocol, which Codex marks experimental. Its handshake and failure handling were checked against Codex 0.155; a live `turn/steer` run remains to be done.
- Claude Code injection was checked live on the host, Daytona and Vercel. Interruption and resumption for Copilot, Kimi and Antigravity are covered by simulated CLIs and a real Docker sandbox, not by live runs.

API: [createSteering](../../reference/createsteering/) · [Steering](../../reference/steering/) · [SteeringDelivery](../../reference/steeringdelivery/) · [DispatchOptions](../../reference/dispatchoptions/).
