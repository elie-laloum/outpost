---
title: "UsageCredential"
description: "UsageCredential — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { UsageCredential } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name       | Type     | Presence          | Meaning                                                                                                                  |
| ---------- | -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `key`      | `string` | Variant-dependent | Literal API key forwarded in the CLI's standard API-key variable. Prefer variable to keep secrets out of source files.   |
| `variable` | `string` | Variant-dependent | Name of a resolved workflow variable holding the API key; its value is forwarded in the CLI's standard API-key variable. |

## Signature

```ts
export type UsageCredential =
  | {
      readonly key: string;
    }
  | {
      readonly variable: string;
    };
```
