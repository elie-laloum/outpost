---
title: "Execution"
description: "Execution — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Execution } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                  | Presence | Meaning                                                                                              |
| -------------- | --------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `text`         | `string`              | Required | Text of every turn of the execution, joined with newlines, including response repair turns.          |
| `turns`        | `readonly Turn[]`     | Required | Every turn in order, including response repairs and turns resumed by steering.                       |
| `usage`        | `Usage`               | Required | Token counters summed over every turn; not a cost.                                                   |
| `conversation` | `string \| undefined` | Optional | Native conversation id of the last turn, when the agent reported one.                                |
| `value`        | `T`                   | Required | Parsed and validated response; undefined without a response option.                                  |
| `completed`    | `boolean`             | Required | True when the last turn's text contains a completion marker, or when a typed response was validated. |
| `completion`   | `string \| undefined` | Optional | Completion marker found in the last turn's text.                                                     |

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
