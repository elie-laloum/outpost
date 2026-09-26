---
title: "HarnessToolResultView"
description: "HarnessToolResultView — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Streaming is not available yet; the contract may change before release.
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
