---
title: "OutpostError"
description: "OutpostError — Outpost API"
sidebar:
  order: 10
---

Public contract for **OutpostError**. See the [errors guide](../../guide/operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import { OutpostError } from "@elie-laloum/outpost";
```

## Purpose and behavior

Identify failure codes and available recovery paths before retrying or cleaning up.

A failed agent throws; a raw command can return a nonzero status. Preserve original errors and recovery artifacts when reporting or retrying.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name       | Type                                | Presence | Meaning                                                                 |
| ---------- | ----------------------------------- | -------- | ----------------------------------------------------------------------- |
| `recovery` | `Readonly<Record<string, unknown>>` | Required | See the linked contract and this family's rules for its interpretation. |
| `code`     | `FaultCode`                         | Required | See the linked contract and this family's rules for its interpretation. |
| `details`  | `Readonly<Record<string, unknown>>` | Required | See the linked contract and this family's rules for its interpretation. |
| `name`     | `string`                            | Required | See the linked contract and this family's rules for its interpretation. |
| `message`  | `string`                            | Required | See the linked contract and this family's rules for its interpretation. |
| `stack`    | `string \| undefined`               | Optional | See the linked contract and this family's rules for its interpretation. |
| `cause`    | `unknown`                           | Optional | See the linked contract and this family's rules for its interpretation. |

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
