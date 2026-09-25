---
title: "Logging"
description: "Logging — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { Logging } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name          | Type                     | Presence          | Meaning                                                                                                                                    |
| ------------- | ------------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `file`        | `string \| undefined`    | Variant-dependent | Local JSONL append destination, mutually exclusive with transporter; absent by default to create a managed journal.                        |
| `transporter` | `Transport \| undefined` | Variant-dependent | Persist the dispatch journal as immutable event segments and a versioned index. Mutually exclusive with file; results expose logReference. |
| `verbose`     | `boolean \| undefined`   | Variant-dependent | Include raw protocol observations in the dispatch journal.                                                                                 |

## Signature

```ts
export type Logging =
  | false
  | "stdout"
  | {
      readonly file?: string;
      readonly transporter?: Transport;
      readonly verbose?: boolean;
    };
```

## Related contracts

- [Transport](../transport/)
