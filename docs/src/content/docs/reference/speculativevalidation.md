---
title: "SpeculativeValidation"
description: "SpeculativeValidation — Outpost API"
sidebar:
  order: 10
---

Public contract for **SpeculativeValidation**. See the [speculative execution guide](../../guide/advanced/speculation/) for behavior, defaults and examples.

## Import

```ts
import type { SpeculativeValidation } from "@elie-laloum/outpost";
```

## Purpose and behavior

Race bounded candidate branches and select the first one that passes explicit validation and cleanup.

Research prototype: at most eight candidates, default concurrency two. No automatic integration, push or durable race resumption. Observed usage is not a billing cap.

[Complete example and detailed rules](../../guide/advanced/speculation/).

## Parameters and properties

| Name      | Type                   | Presence | Meaning                                                                 |
| --------- | ---------------------- | -------- | ----------------------------------------------------------------------- |
| `key`     | `string`               | Required | Stable task or cache key within its owning contract.                    |
| `result`  | `SpeculativeOutput<T>` | Required | See the linked contract and this family's rules for its interpretation. |
| `sandbox` | `Sandbox`              | Required | See the linked contract and this family's rules for its interpretation. |
| `signal`  | `AbortSignal`          | Required | Cooperative cancellation for this operation.                            |

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
