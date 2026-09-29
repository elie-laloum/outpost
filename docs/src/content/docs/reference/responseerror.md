---
title: "ResponseError"
description: "ResponseError — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { ResponseError } from "@elie-laloum/outpost";
```

## Purpose and behavior

OutpostError with code response, thrown when a typed answer has no complete tag or its content fails parsing or validation. A dispatch throws it once no repair turn remains; its recovery then names the conversation, branch, directory and turns.

[Complete example and detailed rules](../../guide/typed-responses/).

## Parameters and properties

| Name       | Type                                | Presence | Meaning                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------- | ----------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tag`      | `string`                            | Required | Tag the response contract expected.                                                                                                                                                                                                                                                                                                                                                     |
| `raw`      | `string \| undefined`               | Required | Trimmed content of the last complete tag that failed parsing or validation; undefined when no complete tag was found.                                                                                                                                                                                                                                                                   |
| `recovery` | `Readonly<Record<string, unknown>>` | Required | Locations of work retained after the failure, such as branch, directory, commits, transcript, logReference or conversation; empty when nothing was retained. A remote synchronization failure puts its transfer directory in details.recovery instead.                                                                                                                                  |
| `code`     | `FaultCode`                         | Required | Stable Outpost fault category used for programmatic failure handling.                                                                                                                                                                                                                                                                                                                   |
| `details`  | `Readonly<Record<string, unknown>>` | Required | Frozen diagnostics for the code: status, stdout, stderr and conversation for a failed agent process; status and retryAfterMs (the minimum wait of a task retry) for an HTTP model error; resetAt for a quota, and fallback when every fallback candidate hit one. unavailable marks an outage for unavailableFault(), including a timeout after an agent reported a connection failure. |
| `name`     | `string`                            | Required | Error class name used to distinguish this failure from other JavaScript errors.                                                                                                                                                                                                                                                                                                         |
| `message`  | `string`                            | Required | Human-readable explanation of the failure.                                                                                                                                                                                                                                                                                                                                              |
| `stack`    | `string \| undefined`               | Optional | JavaScript stack trace for the error, when available.                                                                                                                                                                                                                                                                                                                                   |
| `cause`    | `unknown`                           | Optional | Underlying failure this error wraps; quotaFault() and unavailableFault() follow this chain.                                                                                                                                                                                                                                                                                             |

## Signature

```ts
export declare class ResponseError extends OutpostError {
  readonly tag: string;
  readonly raw: string | undefined;
  constructor(tag: string, message: string, raw?: string, cause?: unknown);
}
```

## Related contracts

- [OutpostError](../outposterror/)
