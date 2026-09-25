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

| Name           | Type                  | Presence | Meaning                                                                                     |
| -------------- | --------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `text`         | `string`              | Required | Final text reported by the agent execution.                                                 |
| `turns`        | `readonly Turn[]`     | Required | Ordered agent-turn results, including text, status, duration and token usage for each pass. |
| `usage`        | `Usage`               | Required | Reported usage counters; not a currency estimate.                                           |
| `conversation` | `string \| undefined` | Optional | Available native conversation identity.                                                     |
| `value`        | `T`                   | Required | Validated structured response value; undefined when no response specification was supplied. |
| `completed`    | `boolean`             | Required | Whether the configured completion marker matched.                                           |
| `completion`   | `string \| undefined` | Optional | Completion marker that matched the agent’s output, when one was found.                      |

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
