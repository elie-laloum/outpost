---
title: "HarnessToolResultView"
description: "HarnessToolResultView — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the built-in harness engine introduced in 5.0.0. The contract may change in a later release.
:::

## Import

```ts
import type { HarnessToolResultView } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type      | Presence | Meaning                                           |
| --------- | --------- | -------- | ------------------------------------------------- |
| `content` | `string`  | Required | Text that will be sent to the model for the call. |
| `isError` | `boolean` | Required | Whether the call is reported as failed.           |

## Signature

```ts
export interface HarnessToolResultView {
  readonly content: string;
  readonly isError: boolean;
}
```
