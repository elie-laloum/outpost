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

| Name      | Type                   | Presence          | Meaning                                                    |
| --------- | ---------------------- | ----------------- | ---------------------------------------------------------- |
| `file`    | `string \| undefined`  | Variant-dependent | Destination path of the dispatch journal.                  |
| `verbose` | `boolean \| undefined` | Variant-dependent | Include raw protocol observations in the dispatch journal. |

## Signature

```ts
export type Logging =
  | false
  | "stdout"
  | {
      readonly file?: string;
      readonly verbose?: boolean;
    };
```
