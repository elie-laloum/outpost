---
title: "HarnessToolExecution"
description: "HarnessToolExecution — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Hooks, permissions, persisted conversations and streaming are not available yet; the contract may change before release.
:::

## Import

```ts
import type { HarnessToolExecution } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                       | Presence | Meaning                                                                                                        |
| ------------- | ------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------- |
| `concurrency` | `number \| undefined`                      | Optional | Maximum number of read-only tools running at once; other tools run one at a time. Defaults to 4.               |
| `deadlineMs`  | `number \| undefined`                      | Optional | Per-call deadline in milliseconds; defaults to 300,000. An expired call is reported to the model as an error.  |
| `onError`     | `"return-to-model" \| "fail" \| undefined` | Optional | return-to-model (default) sends a thrown error back as an error result; fail rejects the turn with that error. |

## Signature

```ts
export interface HarnessToolExecution {
  readonly concurrency?: number;
  readonly deadlineMs?: number;
  readonly onError?: "return-to-model" | "fail";
}
```
