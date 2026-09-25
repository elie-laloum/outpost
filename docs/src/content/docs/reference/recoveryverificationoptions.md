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

| Name            | Type                   | Presence | Meaning                                                                               |
| --------------- | ---------------------- | -------- | ------------------------------------------------------------------------------------- |
| `restorability` | `boolean \| undefined` | Optional | Also verify that retained Git bundles and patches can reconstruct the recorded state. |
| `repository`    | `string \| undefined`  | Optional | Target host Git checkout.                                                             |
| `checksums`     | `boolean \| undefined` | Optional | Compute and compare recorded payload digests during transfer verification.            |
| `maxBytes`      | `number \| undefined`  | Optional | Maximum payload bytes allowed for checksum verification.                              |

## Signature

```ts
export interface RecoveryVerificationOptions {
  readonly restorability?: boolean;
  readonly repository?: string;
  readonly checksums?: boolean;
  readonly maxBytes?: number;
}
```
