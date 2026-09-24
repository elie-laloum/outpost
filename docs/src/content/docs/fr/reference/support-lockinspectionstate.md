---
title: "LockInspectionState"
description: "LockInspectionState — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Signature

```ts
export type LockInspectionState = {
  readonly ownership?: LockOwnership;
} & (
  | {
      readonly state: "present" | "absent";
      readonly pid: number;
    }
  | {
      readonly state: "unknown";
      readonly reason: string;
      readonly pid?: number;
    }
  | {
      readonly state: "skipped";
      readonly reason: "NOT_FILE";
    }
);
```

## Contrats associés

- [LockOwnership](../support-lockownership/)
