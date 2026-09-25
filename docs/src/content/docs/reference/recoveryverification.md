---
title: "RecoveryVerification"
description: "RecoveryVerification — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryVerification } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                                               | Presence | Meaning                                                                                              |
| ----------- | -------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `directory` | `string`                                           | Required | Host directory containing the retained transfer artifacts to verify or restore.                      |
| `scope`     | `"transfer-structure" \| "transfer-restorability"` | Required | Whether verification covered only transfer structure or also Git restorability.                      |
| `complete`  | `boolean`                                          | Required | Whether all requested inspection work completed without hitting scan limits or inaccessible entries. |
| `integrity` | `RecoveryIntegrity`                                | Required | Integrity conclusion from the recorded manifest and available checksum verification.                 |
| `checksums` | `RecoveryChecksumResult \| undefined`              | Optional | Detailed checksum results, byte count and integrity status when hashing was requested.               |
| `checks`    | `readonly RecoveryStructureCheck[]`                | Required | Per-path verification results with pass/fail status and diagnostic code.                             |

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
