---
title: "RunObserver"
description: "RunObserver — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunObserver } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                    | Type                                                  | Presence | Meaning                                                                                                                         |
| ----------------------- | ----------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `errors`                | `readonly unknown[]`                                  | Required | First receiver failure, including asynchronous heartbeat or storage errors; independent of execution outcome.                   |
| `close`                 | `() => Promise<void>`                                 | Required | Stop heartbeats and await queued writes; idempotent, throws the stored failure and does not invent a terminal execution status. |
| `[Symbol.asyncDispose]` | `() => Promise<void>`                                 | Required | Close the receiver when leaving an await using scope.                                                                           |
| `observe`               | `(observation: Observation) => void \| Promise<void>` | Required | Receive one envelope; returned promises are serialized per sink and rejection is isolated from execution.                       |
| `flush`                 | `(() => void \| Promise<void>) \| undefined`          | Optional | Drains the receiver’s own buffer; the hub calls it from flush() with its delivery timeout.                                      |

## Signature

```ts
export interface RunObserver extends ObservationSink {
  readonly errors: readonly unknown[];
  close(): Promise<void>;
  [Symbol.asyncDispose](): Promise<void>;
}
```

## Related contracts

- [ObservationSink](../observationsink/)
