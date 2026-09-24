---
title: "RecoveryVerification"
description: "RecoveryVerification — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryVerification**. Consultez le [guide récupération et rétention](../../operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { RecoveryVerification } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface RecoveryVerification {
  readonly directory: string;
  readonly scope: "transfer-structure" | "transfer-restorability";
  readonly complete: boolean;
  readonly integrity: RecoveryIntegrity;
  readonly checksums?: RecoveryChecksumResult;
  readonly checks: readonly RecoveryStructureCheck[];
}
```

## Contrats associés

- [RecoveryChecksumResult](../support-recoverychecksumresult/)
- [RecoveryIntegrity](../support-recoveryintegrity/)
- [RecoveryStructureCheck](../support-recoverystructurecheck/)
