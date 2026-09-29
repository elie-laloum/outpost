---
title: "verifyRecoveryTransfer"
description: "verifyRecoveryTransfer — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { verifyRecoveryTransfer } from "@elie-laloum/outpost";
```

## Purpose and behavior

Check a retained transfer directory: state.json, the three patches, commits.bundle when commits changed and every listed file, then optionally Git restorability and checksums. Failed checks are reported in the result, not thrown; nothing is applied and the author is not authenticated. restorability without repository or an invalid maxBytes rejects with code configuration.

[Complete example and detailed rules](../../guide/retention/).

## Parameters and properties

| Name                    | Type                                       | Presence | Meaning                                                                                                                                                                                      |
| ----------------------- | ------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `path`                  | `string`                                   | Required | Retained transfer directory to verify; a missing directory rejects with code workspace.                                                                                                      |
| `options`               | `RecoveryVerificationOptions \| undefined` | Optional | Restorability and checksum checks, the repository they use and the hashing limit.                                                                                                            |
| `options.restorability` | `boolean \| undefined`                     | Optional | Clone repository into a temporary directory and check that the commits exist, the bundle unpacks and the three patches apply. Runs only when the structure checks pass; requires repository. |
| `options.repository`    | `string \| undefined`                      | Optional | Git checkout cloned for the restorability check; a shallow or partial clone, or one with alternates, fails that check.                                                                       |
| `options.checksums`     | `boolean \| undefined`                     | Optional | Hash every file listed in checksums.json with SHA-256 and compare kind, size and digest. Runs only when the earlier checks pass.                                                             |
| `options.maxBytes`      | `number \| undefined`                      | Optional | Maximum bytes hashed for checksums, default 1073741824 (1 GiB). Exceeding it fails with CHECKSUM_LIMIT and leaves integrity unverified.                                                      |

## Returns

`Promise<RecoveryVerification>`

## Signature

```ts
export declare function verifyRecoveryTransfer(
  path: string,
  options?: RecoveryVerificationOptions,
): Promise<RecoveryVerification>;
```

## Related contracts

- [RecoveryVerification](../recoveryverification/)
- [RecoveryVerificationOptions](../recoveryverificationoptions/)
