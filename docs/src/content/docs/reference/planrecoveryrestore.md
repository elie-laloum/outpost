---
title: "planRecoveryRestore"
description: "planRecoveryRestore — Outpost API"
sidebar:
  order: 10
---

Public contract for **planRecoveryRestore**. See the [recovery restoration guide](../../guide/operations/recovery-restoration/) for behavior, defaults and examples.

## Import

```ts
import { planRecoveryRestore } from "@elie-laloum/outpost";
```

## Purpose and behavior

Plan then apply a retained transfer into a new destination for review.

Restore into a new directory and inspect before integration. Verification checks recorded structure and integrity; it does not authenticate the author.

[Complete example and detailed rules](../../guide/operations/recovery-restoration/).

## Parameters and properties

| Name                  | Type                       | Presence | Meaning                                                                                  |
| --------------------- | -------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`             | `RecoveryRestoreOptions`   | Required | Configuration object. Its fields are described in the associated options contract below. |
| `options.directory`   | `string`                   | Required | Filesystem directory used by the owning operation; see path rules.                       |
| `options.repository`  | `string`                   | Required | Target host Git checkout.                                                                |
| `options.destination` | `string`                   | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.side`        | `"previous" \| "incoming"` | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.maxBytes`    | `number \| undefined`      | Optional | See the linked contract and this family's rules for its interpretation.                  |

## Returns

`Promise<RecoveryRestorePlan>`

## Signature

```ts
export declare function planRecoveryRestore(
  options: RecoveryRestoreOptions,
): Promise<RecoveryRestorePlan>;
```

## Related contracts

- [RecoveryRestoreOptions](../recoveryrestoreoptions/)
- [RecoveryRestorePlan](../recoveryrestoreplan/)
