---
title: "RecoveryChecksumResult"
description: "RecoveryChecksumResult — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name           | Type                                | Presence | Meaning                                                                                                                                                                                                                    |
| -------------- | ----------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `integrity`    | `RecoveryIntegrity`                 | Required | checksums-match when every manifest entry matches, checksums-mismatch when one differs, unverified when the manifest is missing or invalid or a file could not be hashed within maxBytes.                                  |
| `bytesChecked` | `number`                            | Required | Number of payload bytes actually hashed during verification.                                                                                                                                                               |
| `maxBytes`     | `number`                            | Required | Hashing bound, default 1073741824 (1 GiB). Reaching it stops verification with a CHECKSUM_LIMIT check and leaves integrity unverified.                                                                                     |
| `checks`       | `readonly RecoveryStructureCheck[]` | Required | One check per manifest entry, CHECKSUM_MATCH or CHECKSUM_MISMATCH, ending early with CHECKSUM_LIMIT or CHECKSUM_UNAVAILABLE; or a single failed check on the manifest: CHECKSUMS_UNAVAILABLE or INVALID_CHECKSUM_MANIFEST. |

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
