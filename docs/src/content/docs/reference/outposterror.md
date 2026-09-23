---
title: "OutpostError"
description: "OutpostError — Outpost API"
sidebar:
  order: 10
---

Public contract for **OutpostError**. See the [errors guide](../../operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import { OutpostError } from "@elie-laloum/outpost";
```

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
