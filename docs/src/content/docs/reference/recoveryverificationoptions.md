---
title: "RecoveryVerificationOptions"
description: "RecoveryVerificationOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryVerificationOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                   | Presence | Meaning                                                                                                                                                                                      |
| --------------- | ---------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `restorability` | `boolean \| undefined` | Optional | Clone repository into a temporary directory and check that the commits exist, the bundle unpacks and the three patches apply. Runs only when the structure checks pass; requires repository. |
| `repository`    | `string \| undefined`  | Optional | Git checkout cloned for the restorability check; a shallow or partial clone, or one with alternates, fails that check.                                                                       |
| `checksums`     | `boolean \| undefined` | Optional | Hash every file listed in checksums.json with SHA-256 and compare kind, size and digest. Runs only when the earlier checks pass.                                                             |
| `maxBytes`      | `number \| undefined`  | Optional | Maximum bytes hashed for checksums, default 1073741824 (1 GiB). Exceeding it fails with CHECKSUM_LIMIT and leaves integrity unverified.                                                      |

## Signature

```ts
export interface RecoveryVerificationOptions {
  readonly restorability?: boolean;
  readonly repository?: string;
  readonly checksums?: boolean;
  readonly maxBytes?: number;
}
```
