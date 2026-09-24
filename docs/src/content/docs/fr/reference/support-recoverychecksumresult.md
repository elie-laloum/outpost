---
title: "RecoveryChecksumResult"
description: "RecoveryChecksumResult — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Signature

```ts
export interface RecoveryChecksumResult {
  readonly integrity: RecoveryIntegrity;
  readonly bytesChecked: number;
  readonly maxBytes: number;
  readonly checks: readonly RecoveryStructureCheck[];
}
```

## Contrats associés

- [RecoveryIntegrity](../support-recoveryintegrity/)
- [RecoveryStructureCheck](../support-recoverystructurecheck/)
