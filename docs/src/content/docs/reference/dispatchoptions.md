---
title: "DispatchOptions"
description: "DispatchOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **DispatchOptions**. See the [dispatch guide](../../guide/agents/dispatch/) for behavior, defaults and examples.

## Import

```ts
import type { DispatchOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Run an agent task and collect text, typed output, commits, usage and native conversation information.

One pass is the default. Process or response failures reject. An exhausted pass budget can instead return completed: false. Cold dispatch closes owned resources; warm dispatch retains its sandbox.

[Complete example and detailed rules](../../guide/agents/dispatch/).

## Parameters and properties

| Name            | Type                                                             | Presence | Meaning                                                                 |
| --------------- | ---------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `agent`         | `AgentAdapter \| undefined`                                      | Optional | Native coding-agent adapter.                                            |
| `logging`       | `Logging \| undefined`                                           | Optional | See the linked contract and this family's rules for its interpretation. |
| `label`         | `string \| undefined`                                            | Optional | See the linked contract and this family's rules for its interpretation. |
| `brief`         | `Brief`                                                          | Required | Literal text or file-based task input.                                  |
| `passes`        | `number \| undefined`                                            | Optional | Maximum agent passes; one by default.                                   |
| `until`         | `string \| readonly string[] \| undefined`                       | Optional | Completion marker or markers; an empty list disables matching.          |
| `idleMs`        | `number \| undefined`                                            | Optional | Maximum silent interval in milliseconds.                                |
| `idleWarningMs` | `number \| undefined`                                            | Optional | See the linked contract and this family's rules for its interpretation. |
| `settleMs`      | `number \| undefined`                                            | Optional | See the linked contract and this family's rules for its interpretation. |
| `deadlineMs`    | `number \| undefined`                                            | Optional | Hard operation deadline in milliseconds.                                |
| `expansionMs`   | `number \| undefined`                                            | Optional | See the linked contract and this family's rules for its interpretation. |
| `signal`        | `AbortSignal \| undefined`                                       | Optional | Cooperative cancellation for this operation.                            |
| `continuation`  | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `response`      | `ResponseSpec<T> \| undefined`                                   | Optional | Parser and validator for the tagged agent answer.                       |
| `observe`       | `((event: AgentObservation) => void) \| undefined`               | Optional | Notification callback; observer failures are isolated.                  |
| `warn`          | `((message: string) => void) \| undefined`                       | Optional | See the linked contract and this family's rules for its interpretation. |
| `diagnostic`    | `((message: string) => void) \| undefined`                       | Optional | See the linked contract and this family's rules for its interpretation. |

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
  readonly observe?: (event: AgentObservation) => void;
  readonly warn?: (message: string) => void;
  readonly diagnostic?: (message: string) => void;
}
```

## Related contracts

- [AgentAdapter](../agentadapter/)
- [AgentObservation](../agentobservation/)
- [Brief](../brief/)
- [Logging](../logging/)
- [ResponseSpec](../responsespec/)
