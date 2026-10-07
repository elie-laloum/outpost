---
title: "ReadRunOptions"
description: "ReadRunOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ReadRunOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                       | Presence | Meaning                                                                                      |
| ------------- | -------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `transporter` | `Transport`                | Required | Transport targeting the same location as the execution receiver.                             |
| `id`          | `string`                   | Required | Application-selected run ID to read without taking execution ownership.                      |
| `signal`      | `AbortSignal \| undefined` | Optional | Cancel transport reads and watch polling only; never cancels the observed execution.         |
| `maxBytes`    | `number \| undefined`      | Optional | Per-object read limit in bytes, default 8388608; oversized snapshots or event segments fail. |

## Signature

```ts
export interface ReadRunOptions {
  readonly transporter: Transport;
  readonly id: string;
  readonly signal?: AbortSignal;
  readonly maxBytes?: number;
}
```

## Related contracts

- [Transport](../transport/)
