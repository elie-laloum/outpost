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

Specialized OutpostError for missing tags, invalid JSON or schema rejection in structured answers. It preserves the expected tag, available raw content and underlying cause, and may carry dispatch recovery metadata.

[Complete example and detailed rules](../../guide/agents/responses/).

## Parameters and properties

| Name       | Type                                | Presence | Meaning                                                                         |
| ---------- | ----------------------------------- | -------- | ------------------------------------------------------------------------------- |
| `tag`      | `string`                            | Required | XML-style delimiter identifier.                                                 |
| `raw`      | `string \| undefined`               | Required | Raw tagged response content available when validation failed.                   |
| `recovery` | `Readonly<Record<string, unknown>>` | Required | Metadata describing retained workspace and transfer artifacts after failure.    |
| `code`     | `FaultCode`                         | Required | Stable Outpost fault category used for programmatic failure handling.           |
| `details`  | `Readonly<Record<string, unknown>>` | Required | Structured diagnostic data attached to the fault code.                          |
| `name`     | `string`                            | Required | Error class name used to distinguish this failure from other JavaScript errors. |
| `message`  | `string`                            | Required | Human-readable explanation of the failure.                                      |
| `stack`    | `string \| undefined`               | Optional | JavaScript stack trace for the error, when available.                           |
| `cause`    | `unknown`                           | Optional | Original failure attached to this error.                                        |

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
