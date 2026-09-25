---
title: "verifyRecoveryTransfer"
description: "verifyRecoveryTransfer — Outpost API"
sidebar:
  order: 10
---

Public contract for **verifyRecoveryTransfer**. See the [recovery and retention guide](../../guide/operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import { verifyRecoveryTransfer } from "@elie-laloum/outpost";
```

## Purpose and behavior

Inspect retained work and plan explicit storage retention without discarding recoverable edits.

Planning does not prune. Application reacquires ownership and revalidates candidates. Quota checks observe usage rather than imposing physical filesystem limits.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name                    | Type                                       | Presence | Meaning                                                                                  |
| ----------------------- | ------------------------------------------ | -------- | ---------------------------------------------------------------------------------------- |
| `path`                  | `string`                                   | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options`               | `RecoveryVerificationOptions \| undefined` | Optional | Configuration object. Its fields are described in the associated options contract below. |
| `options.restorability` | `boolean \| undefined`                     | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.repository`    | `string \| undefined`                      | Optional | Target host Git checkout.                                                                |
| `options.checksums`     | `boolean \| undefined`                     | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.maxBytes`      | `number \| undefined`                      | Optional | See the linked contract and this family's rules for its interpretation.                  |

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
