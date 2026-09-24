---
title: "verifyRecoveryTransfer"
description: "verifyRecoveryTransfer — Outpost API"
sidebar:
  order: 10
---

Contrat public de **verifyRecoveryTransfer**. Consultez le [guide récupération et rétention](../../operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { verifyRecoveryTransfer } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function verifyRecoveryTransfer(
  path: string,
  options?: RecoveryVerificationOptions,
): Promise<RecoveryVerification>;
```

## Contrats associés

- [RecoveryVerification](../recoveryverification/)
- [RecoveryVerificationOptions](../recoveryverificationoptions/)
