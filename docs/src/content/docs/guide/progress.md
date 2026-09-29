---
title: "Follow progress"
description: "Print what an agent does while it works, or handle its events in your own code."
---

`createReporter()` prints the agent’s progress in the terminal. Pass it as `observe` to a dispatch.

```ts
import { createReporter, dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Summarize the public API without changing files." },
  observe: createReporter({ label: "API review" }),
});
```

Each line starts with `[API review · pass 1]`. The reporter prints phases, tool calls, the agent’s text and warnings, then a summary with duration, exit status and tokens.

| Option    | Effect                                                                         |
| --------- | ------------------------------------------------------------------------------ |
| `label`   | Replaces `outpost` in the line prefix.                                         |
| `verbose` | Adds tool arguments, result previews, the prompt, the directory and raw lines. |
| `quiet`   | Prints nothing, not even failures.                                             |
| `write`   | Receives the formatted text instead of stdout.                                 |

## Handle events yourself

Pass your own function as `observe`. Narrow on `kind` before reading the other fields.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Summarize the public API without changing files." },
  observe(event) {
    if (event.kind === "tool") console.log(`tool ${event.name}`);
    if (event.kind === "summary")
      console.log(`pass ${event.pass}: ${event.tokens.output} output tokens`);
  },
});
```

Every event also carries `pass`, the agent pass starting at 1, and `at`, an ISO timestamp. A dispatch runs several passes when it repairs a [typed response](../typed-responses/) or when you set `passes`.

| Kind                 | Carries                                | Emitted when                                                                                                    |
| -------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `phase`              | `name`, `agent`, `branch`              | A pass prepares its prompt (`preparing prompt`), then starts the agent (`running`).                             |
| `prompt`             | `text`                                 | The brief is rendered and about to be sent.                                                                     |
| `conversation`       | `id`                                   | The agent reports its conversation id.                                                                          |
| `text`, `text-delta` | `text`                                 | The agent writes a message, or a streamed fragment of one.                                                      |
| `reasoning`          | `text`                                 | The agent exposes readable reasoning.                                                                           |
| `tool`               | `name`, `input`, `callId`              | The agent calls a tool.                                                                                         |
| `tool-result`        | `callId`, `name`, `isError`, `preview` | A tool call returns. `preview` holds its first 2,000 characters, `characters` its length.                       |
| `file-change`        | `changes`                              | The CLI reports structured file edits.                                                                          |
| `usage`              | `tokens`                               | The agent reports token counts.                                                                                 |
| `steer`              | `text`, `mode`                         | A [steering](../steering/) instruction reaches the agent.                                                       |
| `warning`, `failure` | `message`                              | Outpost or the CLI reports a problem, or the agent reports a failed turn.                                       |
| `quota`, `fallback`  | `message`, `resetAt`                   | A [usage limit](../quota-pauses/) stops the agent, or a [fallback](../fallback-agents/) switches.               |
| `stderr`             | `text`, `truncated`                    | The CLI writes to stderr, in bounded lines.                                                                     |
| `stopped`            | `reason`                               | Outpost stops the process: `completion`, `idle-timeout`, `deadline`, `aborted`, `oversized-event` or `steered`. |
| `result`             | `text`                                 | The agent returns its final answer.                                                                             |
| `summary`            | `durationMs`, `status`, `tokens`       | A pass ends, with its total usage.                                                                              |
| `raw`                | `value`                                | The CLI prints a protocol line, before Outpost decodes it.                                                      |

The [built-in harness](../harness/) adds `step`, `subagent`, `tool-output`, `tool-denied`, `hook`, `compaction` and `model-*` events. [AgentObservation](../../reference/agentobservation/) lists every kind and field.

For asynchronous handlers keyed by kind, build the callback with [`createCustomReporter()`](../../reference/createcustomreporter/). The dispatch waits for its handlers before it returns.

:::caution
`raw`, `prompt`, tool inputs and result previews can contain repository content and secrets the agent read. Do not send them to a public log.
:::

## Follow a workflow

`start({ observe })` receives workflow events: task transitions, attempts, retries, usage and the end of the run. Agent events stay on each task: pass `observe` in its request.

```ts
import {
  createReporter,
  defineIsolatedTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const review = defineIsolatedTask({
  key: "review",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    brief: { text: "Summarize the public API without changing files." },
    observe: createReporter({ label: "review" }),
  }),
});
const result = await defineWorkflow("review", [review]).start({
  observe(event) {
    if (event.type === "task") console.log(event.key, event.status);
  },
});
console.log(result.status, result.observerErrors);
```

Each event carries `executionId`, `workflow` and `timestamp`; task events add `key`.

| Group  | `type`                                               | Explained in                                                                                                         |
| ------ | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Run    | `start`, `resume`, `checkpoint`, `finish`            | [Durable runs](../durable-runs/)                                                                                     |
| Tasks  | `task`, `attempt`, `retry`, `usage`, `cache`, `loop` | [Retries](../concurrency-and-retries/), [result cache](../task-cache/), [verification loops](../verification-loops/) |
| People | `gate`, `decision`, `input-request`, `input-answer`  | [Approvals](../approvals/), [interactive tasks](../interactive-tasks/)                                               |
| Limits | `quota`, `budget-exceeded`                           | [Quota pauses](../quota-pauses/), [budgets](../budgets/)                                                             |

## When an observer throws

An observer reports; it does not control the run. An exception in `observe` never cancels or fails the dispatch or workflow. Outpost collects it in `result.observerErrors`.

To stop a run, pass a `signal` ([limits and cancellation](../limits-and-cancellation/)).

## Trace a whole run

`observe` sees one dispatch or one workflow. To receive workflow, agent and operation events in one place, or export traces, use the [observation hub and OpenTelemetry](../observability/). Each dispatch also records its events in a [journal](../journals/) you can read afterwards.

## What each agent reports

Every agent emits text, tool calls and tool results. The other details depend on its CLI protocol.

| Agent                           | Tool call ids                        | Reasoning                 | File changes  | Also                                                                                             |
| ------------------------------- | ------------------------------------ | ------------------------- | ------------- | ------------------------------------------------------------------------------------------------ |
| [Claude Code](../claude-code/)  | Native, `parentCallId` for subagents | Thinking blocks           | No            | `message-usage` per message; `text-delta` with `createClaudeHarness({ partialMessages: true })`. |
| [Codex](../codex/)              | Native item ids                      | Reasoning items           | `file-change` | MCP tools are named `mcp__<server>__<tool>`; a nonzero command exit sets `isError`.              |
| [Copilot CLI](../copilot-cli/)  | Native                               | Yes                       | No            | Session errors arrive as `warning`.                                                              |
| [Kimi Code](../kimi-code/)      | Native                               | Yes                       | No            | Step retries arrive as `warning`.                                                                |
| [Antigravity](../antigravity/)  | `<conversation>:<step index>`        | No                        | No            | Text arrives in fragments; a tool without exposed output has an empty `preview`.                 |
| [Built-in harness](../harness/) | From the model provider              | When the model returns it | No            | `text-delta` while the model streams, plus the harness kinds above.                              |

## Limits

- Keep `observe` fast. Asynchronous work is queued with a bound, and a receiver that falls behind loses events ([delivery rules](../observability/)).
- An interactive terminal session opened with `attach()` produces no events.

API: [createReporter](../../reference/createreporter/) · [createCustomReporter](../../reference/createcustomreporter/) · [AgentObservation](../../reference/agentobservation/) · [WorkflowEvent](../../reference/workflowevent/) · [ReporterOptions](../../reference/reporteroptions/).
