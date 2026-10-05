---
title: "Follow progress"
description: "Receive agent and workflow events while work is running."
---

Pass `createReporter()` as the dispatch’s `observe` callback to print progress in your terminal. Use it to see preparation, agent activity and the final execution summary.

```ts
import { createReporter, dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Summarize the public API without changing files." },
  observe: createReporter({ label: "API review" }),
});
```

Each line starts with `[API review · pass 1]`. The reporter prints phases, tool calls, the agent’s text and warnings, then a summary with duration, exit status and tokens.

API reference: [ReporterOptions](../../reference/reporteroptions/).

## Handle events yourself

Pass your own function as `observe`. Narrow on `kind` before reading the other fields.

```ts
import { reportValue } from "./reporter.ts";
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  brief: { text: "Summarize the public API without changing files." },
  observe(event) {
    if (event.kind === "tool") reportValue(`tool ${event.name}`);
    // Example output: tool read_file
    if (event.kind === "summary")
      reportValue(`pass ${event.pass}: ${event.tokens.output} output tokens`);
    // Example output: pass 1: 320 output tokens
  },
});
```

One dispatch can include several agent passes, for example when it repairs a [typed response](../typed-responses/).

API reference: [AgentObservation](../../reference/agentobservation/).

The [built-in harness](../harness/) adds `step`, `subagent`, `tool-output`, `tool-denied`, `hook`, `compaction` and `model-*` events. [AgentObservation](../../reference/agentobservation/) lists every kind and field.

For asynchronous handlers keyed by kind, build the callback with [`createCustomReporter()`](../../reference/createcustomreporter/). The dispatch waits for its handlers before it returns.

:::caution
`raw`, `prompt`, tool inputs and result previews can contain repository content and secrets the agent read. Do not send them to a public log.
:::

## Follow a workflow

`start({ observe })` receives workflow events: task transitions, attempts, retries, usage and the end of the run. Agent events stay on each task: pass `observe` in its request.

<!-- tabs -->

```ts title="reported-review.ts"
import { defineIsolatedTask, createReporter } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

export const review = defineIsolatedTask({
  key: "review",
  request: () => ({
    repository,
    sandboxProvider,
    agent: coder,
    brief: { text: "Summarize the public API without changing files." },
    observe: createReporter({ label: "review" }),
  }),
});
```

```ts title="report-workflow.ts"
import { reportValue } from "./reporter.ts";
import { defineWorkflow } from "@elie-laloum/outpost";
import { review } from "./reported-review.ts";

export const result = await defineWorkflow("review", [review]).start({
  observe(event) {
    if (event.type === "task") reportValue(event.key, event.status);
    // Example output: review done
  },
});
reportValue(result.status, result.observerErrors);
// Example output: done []
```

API reference: [WorkflowEvent](../../reference/workflowevent/).

## Handle observer errors

An exception in `observe` is recorded in `result.observerErrors`. It does not cancel the dispatch or change the workflow’s result. Use a cancellation signal when you want your code to stop the work.

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
