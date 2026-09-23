---
title: "OutpostError"
description: "OutpostError — Outpost API"
sidebar:
  order: 10
---

Contrat public de **OutpostError**. Consultez le [guide erreurs](../../operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

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

## Contrats associés

- [FaultCode](../faultcode/)
