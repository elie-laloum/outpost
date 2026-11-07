---
title: "LoopTaskExhausted"
description: "LoopTaskExhausted — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { LoopTaskExhausted } from "@elie-laloum/outpost/workflows";
```

## Purpose and behavior

Error recorded when the last permitted round fails verification. Inspect key, maxRounds and feedback through WorkflowResult.errors; resuming the same checkpoint does not reset the limit. The message quotes the first and last 1,000 characters of the last feedback, which a workflow masks with its redact patterns before cutting it; the feedback property keeps the full text.

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
  /** `shown` is the feedback quoted in the message, such as a redacted copy; it defaults to `feedback`. */
  constructor(key: string, maxRounds: number, feedback: string, shown?: string);
}
```
