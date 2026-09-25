---
title: "SpeculativeValidation"
description: "SpeculativeValidation — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SpeculativeValidation } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                   | Presence | Meaning                                                                                              |
| --------- | ---------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `key`     | `string`               | Required | Unique candidate key used to correlate its branch, validation and final result.                      |
| `result`  | `SpeculativeOutput<T>` | Required | Candidate dispatch output with text, commits, usage and typed value, excluding continuation methods. |
| `sandbox` | `Sandbox`              | Required | Live candidate sandbox available for validation commands before cleanup.                             |
| `signal`  | `AbortSignal`          | Required | Cooperative cancellation for this operation.                                                         |

## Signature

```ts
export interface SpeculativeValidation<T> {
  readonly key: string;
  readonly result: SpeculativeOutput<T>;
  readonly sandbox: Sandbox;
  readonly signal: AbortSignal;
}
```

## Related contracts

- [Sandbox](../sandbox/)
- [SpeculativeOutput](../speculativeoutput/)
