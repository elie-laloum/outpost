---
title: "TerminationCode"
description: "TerminationCode — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { TerminationCode } from "@elie-laloum/outpost/core";
```

## Purpose and behavior

Shared termination reason vocabulary for workflow results and speculation coordinator stops. Includes FaultCode, failed for unclassified errors and usage-unavailable for incomplete budget accounting. Each result documents its applicable codes; dispatch continues to throw OutpostError with its existing code. Budget exhaustion uses limit, not the speculation status budget-exhausted.

[Complete example and detailed rules](../../guide/error-handling/).

## Signature

```ts
export type TerminationCode = FaultCode | "failed" | "usage-unavailable";
```

## Related contracts

- [FaultCode](../faultcode/)
