---
title: "ToolOutput"
description: "ToolOutput — Outpost API"
sidebar:
  order: 10
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Persisted conversations, built-in toolsets and streaming are not available yet; the contract may change before release.
:::

## Import

```ts
import type { ToolOutput } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name      | Type                   | Presence          | Meaning                                             |
| --------- | ---------------------- | ----------------- | --------------------------------------------------- |
| `content` | `string`               | Variant-dependent | Text returned to the model for the call.            |
| `isError` | `boolean \| undefined` | Variant-dependent | Report the call as failed so the model can recover. |

## Signature

```ts
export type ToolOutput =
  | string
  | {
      readonly content: string;
      readonly isError?: boolean;
    };
```
