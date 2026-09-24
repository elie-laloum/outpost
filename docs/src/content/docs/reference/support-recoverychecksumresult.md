---
title: "RecoveryChecksumResult"
description: "RecoveryChecksumResult — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Signature

```ts
export interface RecoveryChecksumResult {
  readonly integrity: RecoveryIntegrity;
  readonly bytesChecked: number;
  readonly maxBytes: number;
  readonly checks: readonly RecoveryStructureCheck[];
}
```

## Related contracts

- [RecoveryIntegrity](../support-recoveryintegrity/)
- [RecoveryStructureCheck](../support-recoverystructurecheck/)
