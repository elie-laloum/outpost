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

| Name       | Type                                | Presence | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------- | ----------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tag`      | `string`                            | Required | Tag the response contract expected.                                                                                                                                                                                                                                                                                                                                                                                                   |
| `raw`      | `string \| undefined`               | Required | Trimmed content of the last complete tag that failed parsing or validation; undefined when no complete tag was found.                                                                                                                                                                                                                                                                                                                 |
| `recovery` | `Readonly<Record<string, unknown>>` | Required | Metadata describing retained workspace and transfer artifacts after failure.                                                                                                                                                                                                                                                                                                                                                          |
| `code`     | `FaultCode`                         | Required | Stable Outpost fault category used for programmatic failure handling.                                                                                                                                                                                                                                                                                                                                                                 |
| `details`  | `Readonly<Record<string, unknown>>` | Required | Structured diagnostics attached to the fault code. HTTP model errors include status and, when valid, retryAfterMs: the minimum wait in milliseconds for an explicitly configured task retry. Quota errors include resetAt when the reset time is known, and agent for CLI turns. Agent and model outages add unavailable, the signal read by unavailableFault(); a quota error summarizing an exhausted fallback agent adds fallback. |
| `name`     | `string`                            | Required | Error class name used to distinguish this failure from other JavaScript errors.                                                                                                                                                                                                                                                                                                                                                       |
| `message`  | `string`                            | Required | Human-readable explanation of the failure.                                                                                                                                                                                                                                                                                                                                                                                            |
| `stack`    | `string \| undefined`               | Optional | JavaScript stack trace for the error, when available.                                                                                                                                                                                                                                                                                                                                                                                 |
| `cause`    | `unknown`                           | Optional | Original failure attached to this error.                                                                                                                                                                                                                                                                                                                                                                                              |

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
