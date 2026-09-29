---
title: "HarnessToolExecution"
description: "HarnessToolExecution — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessToolExecution } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                       | Presence | Meaning                                                                                                                                                                                           |
| ------------- | ------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `concurrency` | `number \| undefined`                      | Optional | Maximum read-only calls run in parallel, default 4. Consecutive read-only calls from one model response run together; any other call runs alone, in order.                                        |
| `deadlineMs`  | `number \| undefined`                      | Optional | Deadline of each tool call, default 300000 (5 minutes). On expiry the tool's signal aborts and the call fails with code timeout, handled by onError.                                              |
| `onError`     | `"return-to-model" \| "fail" \| undefined` | Optional | What a failed tool call does, including a timeout or a failed subagent: return-to-model (default) sends the error message to the model as an error result; fail rejects the turn with that error. |

## Signature

```ts
export interface HarnessToolExecution {
  readonly concurrency?: number;
  readonly deadlineMs?: number;
  readonly onError?: "return-to-model" | "fail";
}
```
