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

| Name            | Type                                                             | Presence | Meaning                                                                                                                                              |
| --------------- | ---------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agent`         | `AgentAdapter \| undefined`                                      | Optional | Native coding-agent adapter.                                                                                                                         |
| `logging`       | `Logging \| undefined`                                           | Optional | Configure the dispatch journal file and verbose event retention.                                                                                     |
| `label`         | `string \| undefined`                                            | Optional | Human-readable label used in execution reporting.                                                                                                    |
| `brief`         | `Brief`                                                          | Required | Literal text or file-based task input.                                                                                                               |
| `passes`        | `number \| undefined`                                            | Optional | Maximum agent passes; one by default.                                                                                                                |
| `until`         | `string \| readonly string[] \| undefined`                       | Optional | Completion marker or markers; an empty list disables matching.                                                                                       |
| `idleMs`        | `number \| undefined`                                            | Optional | Maximum silent interval in milliseconds.                                                                                                             |
| `idleWarningMs` | `number \| undefined`                                            | Optional | Silence interval in milliseconds before emitting an idle warning.                                                                                    |
| `settleMs`      | `number \| undefined`                                            | Optional | Grace period in milliseconds after completion detection before stopping a lingering agent process.                                                   |
| `deadlineMs`    | `number \| undefined`                                            | Optional | Maximum duration of each agent process in milliseconds; defaults to one hour.                                                                        |
| `expansionMs`   | `number \| undefined`                                            | Optional | Deadline in milliseconds for each original shell expansion in a file brief; defaults to 30000.                                                       |
| `signal`        | `AbortSignal \| undefined`                                       | Optional | Cooperative cancellation for this operation.                                                                                                         |
| `continuation`  | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optional | Native conversation ID to continue; fork requests a separate conversation derived from it.                                                           |
| `response`      | `ResponseSpec<T> \| undefined`                                   | Optional | Parser and validator for the tagged agent answer.                                                                                                    |
| `telemetry`     | `DispatchTelemetry \| undefined`                                 | Optional | Optional instrumentation of the complete dispatch, including preparation, synchronization and cleanup; telemetry failures do not change its outcome. |
| `observe`       | `((event: AgentObservation) => void) \| undefined`               | Optional | Receive normalized agent observations with pass number and timestamp; observer failures are isolated.                                                |
| `warn`          | `((message: string) => void) \| undefined`                       | Optional | Callback receiving nonfatal execution or conversation-storage warnings.                                                                              |
| `diagnostic`    | `((message: string) => void) \| undefined`                       | Optional | Callback receiving execution diagnostic messages.                                                                                                    |

## Signature

```ts
export interface DispatchOptions<T = undefined> {
  readonly agent?: AgentAdapter;
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

- [AgentAdapter](../agentadapter/)
- [AgentObservation](../agentobservation/)
- [Brief](../brief/)
- [DispatchTelemetry](../dispatchtelemetry/)
- [Logging](../logging/)
- [ResponseSpec](../responsespec/)
