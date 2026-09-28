---
title: "LoopCheckResult"
description: "LoopCheckResult — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { LoopCheckResult } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name       | Type            | Presence          | Meaning                                                                                                   |
| ---------- | --------------- | ----------------- | --------------------------------------------------------------------------------------------------------- |
| `done`     | `true \| false` | Required          | True accepts this candidate and completes the loop; false advances to another round if the limit permits. |
| `feedback` | `string`        | Variant-dependent | Required text when done is false, passed unchanged to the next attempt and preserved on exhaustion.       |

## Signature

```ts
export type LoopCheckResult =
  | {
      readonly done: true;
    }
  | {
      readonly done: false;
      readonly feedback: string;
    };
```
