---
title: "RecoveryVerification"
description: "RecoveryVerification — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryVerification**. See the [recovery and retention guide](../../operations/recovery/) for behavior, defaults and examples.

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

## Related contracts

- [RecoveryChecksumResult](../support-recoverychecksumresult/)
- [RecoveryIntegrity](../support-recoveryintegrity/)
- [RecoveryStructureCheck](../support-recoverystructurecheck/)
