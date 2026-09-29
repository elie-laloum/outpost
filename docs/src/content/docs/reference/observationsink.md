---
title: "ObservationSink"
description: "ObservationSink — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ObservationSink } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                                  | Presence | Meaning                                                                                                   |
| --------- | ----------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `observe` | `(observation: Observation) => void \| Promise<void>` | Required | Receive one envelope; returned promises are serialized per sink and rejection is isolated from execution. |
| `flush`   | `(() => void \| Promise<void>) \| undefined`          | Optional | Drains the receiver’s own buffer; the hub calls it from flush() with its delivery timeout.                |

## Signature

```ts
export interface ObservationSink {
  observe(observation: Observation): void | Promise<void>;
  flush?(): void | Promise<void>;
}
```

## Related contracts

- [Observation](../observation/)
