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

Verify a retained transfer’s directory structure, optionally hashing payloads and checking Git restorability within maxBytes. Returns detailed checks and integrity status without applying incoming changes or authenticating their author.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name                    | Type                                       | Presence | Meaning                                                                               |
| ----------------------- | ------------------------------------------ | -------- | ------------------------------------------------------------------------------------- |
| `path`                  | `string`                                   | Required | Retained transfer directory to verify.                                                |
| `options`               | `RecoveryVerificationOptions \| undefined` | Optional | Enable checksum and Git restorability checks and set their repository and byte bound. |
| `options.restorability` | `boolean \| undefined`                     | Optional | Also verify that retained Git bundles and patches can reconstruct the recorded state. |
| `options.repository`    | `string \| undefined`                      | Optional | Target host Git checkout.                                                             |
| `options.checksums`     | `boolean \| undefined`                     | Optional | Compute and compare recorded payload digests during transfer verification.            |
| `options.maxBytes`      | `number \| undefined`                      | Optional | Maximum payload bytes allowed for checksum verification.                              |

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
