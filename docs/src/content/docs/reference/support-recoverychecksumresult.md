---
title: "RecoveryChecksumResult"
description: "RecoveryChecksumResult — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name           | Type                                | Presence | Meaning                                                                              |
| -------------- | ----------------------------------- | -------- | ------------------------------------------------------------------------------------ |
| `integrity`    | `RecoveryIntegrity`                 | Required | Integrity conclusion from the recorded manifest and available checksum verification. |
| `bytesChecked` | `number`                            | Required | Number of payload bytes actually hashed during verification.                         |
| `maxBytes`     | `number`                            | Required | Maximum payload bytes allowed for checksum verification.                             |
| `checks`       | `readonly RecoveryStructureCheck[]` | Required | Per-path verification results with pass/fail status and diagnostic code.             |

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
