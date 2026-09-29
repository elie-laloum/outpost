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

Error that Outpost throws with a stable code, frozen details and a recovery record. cause holds the failure it reclassified or wrapped. You can throw it yourself with new OutpostError(code, message, details?, cause?).

[Complete example and detailed rules](../../guide/error-handling/).

## Parameters and properties

| Name       | Type                                | Presence | Meaning                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------- | ----------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `recovery` | `Readonly<Record<string, unknown>>` | Required | Locations of work retained after the failure, such as branch, directory, commits, transcript, logReference or conversation; empty when nothing was retained. A remote synchronization failure puts its transfer directory in details.recovery instead.                                                                                                                                  |
| `code`     | `FaultCode`                         | Required | Stable Outpost fault category used for programmatic failure handling.                                                                                                                                                                                                                                                                                                                   |
| `details`  | `Readonly<Record<string, unknown>>` | Required | Frozen diagnostics for the code: status, stdout, stderr and conversation for a failed agent process; status and retryAfterMs (the minimum wait of a task retry) for an HTTP model error; resetAt for a quota, and fallback when every fallback candidate hit one. unavailable marks an outage for unavailableFault(), including a timeout after an agent reported a connection failure. |
| `name`     | `string`                            | Required | Error class name used to distinguish this failure from other JavaScript errors.                                                                                                                                                                                                                                                                                                         |
| `message`  | `string`                            | Required | Human-readable explanation of the failure.                                                                                                                                                                                                                                                                                                                                              |
| `stack`    | `string \| undefined`               | Optional | JavaScript stack trace for the error, when available.                                                                                                                                                                                                                                                                                                                                   |
| `cause`    | `unknown`                           | Optional | Underlying failure this error wraps; quotaFault() and unavailableFault() follow this chain.                                                                                                                                                                                                                                                                                             |

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
