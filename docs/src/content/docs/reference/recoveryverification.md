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

| Name        | Type                                               | Presence | Meaning                                                                                                                                      |
| ----------- | -------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `directory` | `string`                                           | Required | Resolved real path of the verified transfer directory.                                                                                       |
| `scope`     | `"transfer-structure" \| "transfer-restorability"` | Required | transfer-restorability when restorability was requested, otherwise transfer-structure.                                                       |
| `complete`  | `boolean`                                          | Required | Whether every check passed.                                                                                                                  |
| `integrity` | `RecoveryIntegrity`                                | Required | checksums-match or checksums-mismatch after checksum verification; unverified when checksums were not requested or could not run to the end. |
| `checksums` | `RecoveryChecksumResult \| undefined`              | Optional | Checksum integrity, bytesChecked, maxBytes and per-file checks; present when checksums was requested and the earlier checks passed.          |
| `checks`    | `readonly RecoveryStructureCheck[]`                | Required | Every check run, in order, with path, pass or fail status and a code such as FILE_PRESENT, CHECKSUM_MISMATCH or PATCH_APPLIES.               |

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
