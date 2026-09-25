---
title: "Turn"
description: "Turn — Outpost API"
sidebar:
  order: 10
---

Public contract for **Turn**. See the [dispatch guide](../../guide/agents/dispatch/) for behavior, defaults and examples.

## Import

```ts
import type { Turn } from "@elie-laloum/outpost";
```

## Purpose and behavior

Run an agent task and collect text, typed output, commits, usage and native conversation information.

One pass is the default. Process or response failures reject. An exhausted pass budget can instead return completed: false. Cold dispatch closes owned resources; warm dispatch retains its sandbox.

[Complete example and detailed rules](../../guide/agents/dispatch/).

## Parameters and properties

| Name           | Type                  | Presence | Meaning                                                                 |
| -------------- | --------------------- | -------- | ----------------------------------------------------------------------- |
| `text`         | `string`              | Required | Text content; see the owning operation for its source.                  |
| `status`       | `number`              | Required | Recorded process or lifecycle outcome; inspect its declared type.       |
| `conversation` | `string \| undefined` | Optional | Available native conversation identity.                                 |
| `transcript`   | `string \| undefined` | Optional | Available host path to the captured transcript.                         |
| `usage`        | `Usage`               | Required | Reported usage counters; not a currency estimate.                       |
| `durationMs`   | `number`              | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface Turn {
  readonly text: string;
  readonly status: number;
  readonly conversation?: string;
  readonly transcript?: string;
  readonly usage: Usage;
  readonly durationMs: number;
}
```

## Related contracts

- [Usage](../usage/)
