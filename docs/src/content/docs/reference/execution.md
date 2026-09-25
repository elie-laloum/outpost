---
title: "Execution"
description: "Execution — Outpost API"
sidebar:
  order: 10
---

Public contract for **Execution**. See the [dispatch guide](../../guide/agents/dispatch/) for behavior, defaults and examples.

## Import

```ts
import type { Execution } from "@elie-laloum/outpost";
```

## Purpose and behavior

Run an agent task and collect text, typed output, commits, usage and native conversation information.

One pass is the default. Process or response failures reject. An exhausted pass budget can instead return completed: false. Cold dispatch closes owned resources; warm dispatch retains its sandbox.

[Complete example and detailed rules](../../guide/agents/dispatch/).

## Parameters and properties

| Name           | Type                  | Presence | Meaning                                                                 |
| -------------- | --------------------- | -------- | ----------------------------------------------------------------------- |
| `text`         | `string`              | Required | Text content; see the owning operation for its source.                  |
| `turns`        | `readonly Turn[]`     | Required | See the linked contract and this family's rules for its interpretation. |
| `usage`        | `Usage`               | Required | Reported usage counters; not a currency estimate.                       |
| `conversation` | `string \| undefined` | Optional | Available native conversation identity.                                 |
| `value`        | `T`                   | Required | Typed value produced or consumed by this contract.                      |
| `completed`    | `boolean`             | Required | Whether the configured completion marker matched.                       |
| `completion`   | `string \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface Execution<T> {
  readonly text: string;
  readonly turns: readonly Turn[];
  readonly usage: Usage;
  readonly conversation?: string;
  readonly value: T;
  readonly completed: boolean;
  readonly completion?: string;
}
```

## Related contracts

- [Turn](../turn/)
- [Usage](../usage/)
