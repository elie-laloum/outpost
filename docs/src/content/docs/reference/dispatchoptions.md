---
title: "DispatchOptions"
description: "DispatchOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DispatchOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                                                             | Presence | Meaning                                                                                                                                                                                                                  |
| --------------- | ---------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `observation`   | `ObservationHub \| undefined`                                    | Optional | Parent observation hub. The dispatch opens a child hub with its own dispatchId and drains it before returning or throwing.                                                                                               |
| `agent`         | `DispatchAgent \| undefined`                                     | Optional | Agent that runs the brief: one from createAgent() or createReplayAgent(), or a createFallbackAgent() that moves to its next candidate on a listed quota or unavailable fault. A fallback agent cannot take continuation. |
| `logging`       | `Logging \| undefined`                                           | Optional | Journal settings: transport, verbose event retention and commit recording for replay.                                                                                                                                    |
| `label`         | `string \| undefined`                                            | Optional | Name shown for this dispatch in progress reports.                                                                                                                                                                        |
| `brief`         | `Brief`                                                          | Required | Task given to the agent: literal text or a file brief.                                                                                                                                                                   |
| `passes`        | `number \| undefined`                                            | Optional | Maximum passes, default 1. Each pass reruns the brief in a new conversation and the dispatch stops at the first pass whose text contains a completion marker. Must be 1 with response or continuation.                   |
| `until`         | `string \| readonly string[] \| undefined`                       | Optional | Completion marker or markers searched in the last turn's text, default &lt;outpost>done&lt;/outpost>. An empty list disables matching, so every pass runs; empty strings are rejected.                                   |
| `idleMs`        | `number \| undefined`                                            | Optional | Longest silence allowed from the agent, default 600000 (10 minutes). Past it the turn stops with code timeout.                                                                                                           |
| `idleWarningMs` | `number \| undefined`                                            | Optional | Silence after which a warning event is emitted, then repeated at the same interval; default 60000.                                                                                                                       |
| `settleMs`      | `number \| undefined`                                            | Optional | Wait after a completion marker before stopping an agent that is still running, default 60000. The turn still succeeds.                                                                                                   |
| `deadlineMs`    | `number \| undefined`                                            | Optional | Maximum duration of each agent process, default 3600000 (one hour). Past it the turn fails with code timeout.                                                                                                            |
| `expansionMs`   | `number \| undefined`                                            | Optional | Deadline for each shell expansion in a file brief, default 30000. Past it the dispatch fails with code timeout.                                                                                                          |
| `signal`        | `AbortSignal \| undefined`                                       | Optional | Aborting it stops the agent process and rejects the dispatch with the signal's reason.                                                                                                                                   |
| `steering`      | `Steering \| undefined`                                          | Optional | Controller from createSteering(), attached for the whole dispatch and released when it ends. resume() and fork() do not reuse it.                                                                                        |
| `continuation`  | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optional | Native conversation to continue, by id; fork: true continues a copy and leaves the original unchanged. Requires one pass and an agent that supports resume.                                                              |
| `response`      | `ResponseSpec<T> \| undefined`                                   | Optional | Typed response contract: the tagged answer is parsed and validated, and an invalid answer gets up to repairs correction turns. Requires one pass.                                                                        |
| `telemetry`     | `DispatchTelemetry \| undefined`                                 | Optional | Instrumentation spanning the whole dispatch, including preparation, synchronization and cleanup. Its failures do not change the outcome.                                                                                 |
| `observe`       | `((event: AgentObservation) => void) \| undefined`               | Optional | Receives each normalized agent event with its pass number and timestamp. An exception thrown here is collected in observerErrors and does not change the outcome.                                                        |
| `warn`          | `((message: string) => void) \| undefined`                       | Optional | Receives nonfatal warnings, such as an idle agent or a conversation storage problem.                                                                                                                                     |
| `diagnostic`    | `((message: string) => void) \| undefined`                       | Optional | Receives diagnostic messages, such as the estimated token size of each expanded brief command.                                                                                                                           |

## Signature

```ts
export interface DispatchOptions<T = undefined> {
  readonly observation?: ObservationHub;
  readonly agent?: DispatchAgent;
  readonly logging?: Logging;
  readonly label?: string;
  readonly brief: Brief;
  readonly passes?: number;
  readonly until?: string | readonly string[];
  readonly idleMs?: number;
  readonly idleWarningMs?: number;
  readonly settleMs?: number;
  readonly deadlineMs?: number;
  readonly expansionMs?: number;
  readonly signal?: AbortSignal;
  /** Controller from createSteering() that sends instructions while the agent runs. */
  readonly steering?: Steering;
  readonly continuation?: {
    readonly id: string;
    readonly fork?: boolean;
  };
  readonly response?: ResponseSpec<T>;
  readonly telemetry?: DispatchTelemetry;
  readonly observe?: (event: AgentObservation) => void;
  readonly warn?: (message: string) => void;
  readonly diagnostic?: (message: string) => void;
}
```

## Related contracts

- [AgentObservation](../agentobservation/)
- [Brief](../brief/)
- [DispatchAgent](../dispatchagent/)
- [DispatchTelemetry](../dispatchtelemetry/)
- [Logging](../logging/)
- [ObservationHub](../observationhub/)
- [ResponseSpec](../responsespec/)
- [Steering](../steering/)
