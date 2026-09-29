---
title: "LoopTaskExhausted"
description: "LoopTaskExhausted — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { LoopTaskExhausted } from "@elie-laloum/outpost";
```

## Purpose and behavior

Error recorded when the last permitted round fails verification. Inspect key, maxRounds and feedback through WorkflowResult.errors; resuming the same checkpoint does not reset the limit.

[Complete example and detailed rules](../../guide/verification-loops/).

## Parameters and properties

| Name        | Type                  | Presence | Meaning                                                                                     |
| ----------- | --------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `key`       | `string`              | Required | Key of the loop task whose verification never succeeded.                                    |
| `maxRounds` | `number`              | Required | Configured logical round limit reached by this loop.                                        |
| `feedback`  | `string`              | Required | Text returned by the last rejected verification.                                            |
| `name`      | `string`              | Required | Error class name used to distinguish this failure from other JavaScript errors.             |
| `message`   | `string`              | Required | Human-readable explanation of the failure.                                                  |
| `stack`     | `string \| undefined` | Optional | JavaScript stack trace for the error, when available.                                       |
| `cause`     | `unknown`             | Optional | Underlying failure this error wraps; quotaFault() and unavailableFault() follow this chain. |

## Signature

```ts
export declare class LoopTaskExhausted extends Error {
  readonly key: string;
  readonly maxRounds: number;
  readonly feedback: string;
  constructor(key: string, maxRounds: number, feedback: string);
}
```
