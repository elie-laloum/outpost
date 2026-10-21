---
title: "ObservationReadOptions"
description: "ObservationReadOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ObservationReadOptions } from "@elie-laloum/outpost/core";
```

## Parameters and properties

| Name       | Type                       | Presence | Meaning                                                                                      |
| ---------- | -------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `signal`   | `AbortSignal \| undefined` | Optional | Cancel transport reads and watch polling only; never cancels the observed execution.         |
| `maxBytes` | `number \| undefined`      | Optional | Per-object read limit in bytes, default 8388608; oversized snapshots or event segments fail. |

## Signature

```ts
export interface ObservationReadOptions extends Omit<
  ReadRunOptions,
  "transporter" | "id"
> {}
```

## Related contracts

- [ReadRunOptions](../readrunoptions/)
