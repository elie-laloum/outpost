---
title: "OutpostError"
description: "OutpostError — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { OutpostError } from "@elie-laloum/outpost";
```

## Purpose and behavior

Error with a stable fault code and structured details for execution, configuration and recovery failures. cause preserves the original failure and recovery may identify retained work; branch cleanup must respect those recovery locations.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name       | Type                                | Presence | Meaning                                                                         |
| ---------- | ----------------------------------- | -------- | ------------------------------------------------------------------------------- |
| `recovery` | `Readonly<Record<string, unknown>>` | Required | Metadata describing retained workspace and transfer artifacts after failure.    |
| `code`     | `FaultCode`                         | Required | Stable Outpost fault category used for programmatic failure handling.           |
| `details`  | `Readonly<Record<string, unknown>>` | Required | Structured diagnostic data attached to the fault code.                          |
| `name`     | `string`                            | Required | Error class name used to distinguish this failure from other JavaScript errors. |
| `message`  | `string`                            | Required | Human-readable explanation of the failure.                                      |
| `stack`    | `string \| undefined`               | Optional | JavaScript stack trace for the error, when available.                           |
| `cause`    | `unknown`                           | Optional | Original failure attached to this error.                                        |

## Signature

```ts
export declare class OutpostError extends Error {
  recovery: Readonly<Record<string, unknown>>;
  readonly code: FaultCode;
  readonly details: Readonly<Record<string, unknown>>;
  constructor(
    code: FaultCode,
    message: string,
    details?: Record<string, unknown>,
    cause?: unknown,
  );
}
```

## Related contracts

- [FaultCode](../faultcode/)
