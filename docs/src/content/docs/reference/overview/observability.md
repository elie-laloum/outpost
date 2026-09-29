---
title: "Observability — Overview"
description: "Follow what a dispatch or workflow does through agent events, hub sinks, reporters, telemetry, journals and token usage."
sidebar:
  label: Overview
  order: 0
---

## Choose an observer

Every observer receives copies of events. Observer failures are collected, in `observerErrors` or `onError`, and never change a run’s outcome.

| Observer                          | Pass it as                              | Receives                                          | Use it for                                     |
| --------------------------------- | --------------------------------------- | ------------------------------------------------- | ---------------------------------------------- |
| `createReporter()`                | `observe` on a dispatch                 | Agent events of one dispatch                      | Terminal progress lines                        |
| `createCustomReporter(handlers)`  | `observe` on a dispatch                 | Agent events, routed by `kind`                    | Your logger, with a `flush()` barrier          |
| `createObservationHub({ sinks })` | `observation` on a workflow or dispatch | Every event of the run, with `seq` and `scope`    | One ordered stream across tasks and operations |
| `createOpenTelemetryObserver()`   | Its `sink` on a hub, or `telemetry`     | Workflow, task, dispatch and operation lifecycles | Spans and metrics                              |
| `logging` settings                | `logging` on a dispatch                 | The dispatch’s events, stored through a transport | A journal to read with `readJournal()`         |
| `createReplayAgent({ journal })`  | `agent` on a dispatch                   | A recorded journal                                | Rerunning a dispatch without a model           |

:::caution
Delivery is live and bounded, the journal included: a receiver that falls behind loses events. The loss shows in `observerErrors` and the hub’s `dropped` count.
:::

## When token usage arrives

A `usage` event carries an increment; a pass’s `summary` and the dispatch result hold totals. `Usage.complete: false` marks counters as a lower bound.

| Agent            | Usage reported                                                                 |
| ---------------- | ------------------------------------------------------------------------------ |
| Claude Code      | At the end of each turn; `message-usage` per message is not counted            |
| Codex            | At the end of each turn; after each model response when steering injects input |
| Copilot CLI      | After each model response, then reconciled with the session total at exit      |
| Kimi Code        | Once, read from the session after the CLI exits                                |
| Antigravity      | At the end of each turn                                                        |
| Built-in harness | After each model response, subagents included                                  |

Workflow totals and budgets build on these counters: see [WorkflowUsage](../../workflowusage/).

## Entry points

Guide: [Observation hub and OpenTelemetry](../../../guide/observability/) · [Follow progress](../../../guide/progress/) · [Journals](../../../guide/journals/)

- [createObservationHub](../../createobservationhub/)
- [createReporter](../../createreporter/)
- [createCustomReporter](../../createcustomreporter/)
- [createOpenTelemetryObserver](../../createopentelemetryobserver/)
- [createReplayAgent](../../createreplayagent/)
- [ObservationHub](../../observationhub/)
- [Observation](../../observation/)
- [AgentEvent](../../agentevent/)
- [AgentObservation](../../agentobservation/)
- [Usage](../../usage/)
- [Logging](../../logging/)
- [DispatchTelemetry](../../dispatchtelemetry/)
