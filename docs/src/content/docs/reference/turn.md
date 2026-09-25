---
title: "Turn"
description: "Turn — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Turn } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                  | Type                              | Presence | Meaning                                                                                                              |
| --------------------- | --------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `text`                | `string`                          | Required | Text reported for this single agent pass.                                                                            |
| `status`              | `number`                          | Required | Process exit code; zero denotes success.                                                                             |
| `conversation`        | `string \| undefined`             | Optional | Available native conversation identity.                                                                              |
| `transcript`          | `string \| undefined`             | Optional | Available host path to the captured transcript.                                                                      |
| `transcriptReference` | `TransportReference \| undefined` | Optional | Pinned remote index of the conversation captured after this turn; its local transcript remains available separately. |
| `usage`               | `Usage`                           | Required | Reported usage counters; not a currency estimate.                                                                    |
| `durationMs`          | `number`                          | Required | Elapsed execution time in milliseconds.                                                                              |

## Signature

```ts
export interface Turn {
  readonly text: string;
  readonly status: number;
  readonly conversation?: string;
  readonly transcript?: string;
  readonly transcriptReference?: TransportReference;
  readonly usage: Usage;
  readonly durationMs: number;
}
```

## Related contracts

- [TransportReference](../transportreference/)
- [Usage](../usage/)
