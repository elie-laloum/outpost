---
title: "RecoveryRestorePlan"
description: "RecoveryRestorePlan — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryRestorePlan**. See the [recovery restoration guide](../../guide/operations/recovery-restoration/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryRestorePlan } from "@elie-laloum/outpost";
```

## Purpose and behavior

Plan then apply a retained transfer into a new destination for review.

Restore into a new directory and inspect before integration. Verification checks recorded structure and integrity; it does not authenticate the author.

[Complete example and detailed rules](../../guide/operations/recovery-restoration/).

## Parameters and properties

| Name             | Type                           | Presence | Meaning                                                                 |
| ---------------- | ------------------------------ | -------- | ----------------------------------------------------------------------- |
| `fingerprint`    | `string`                       | Required | See the linked contract and this family's rules for its interpretation. |
| `manifestSha256` | `string`                       | Required | See the linked contract and this family's rules for its interpretation. |
| `commit`         | `string`                       | Required | See the linked contract and this family's rules for its interpretation. |
| `payloads`       | `readonly string[]`            | Required | See the linked contract and this family's rules for its interpretation. |
| `staging`        | `"unavailable" \| "preserved"` | Required | See the linked contract and this family's rules for its interpretation. |
| `directory`      | `string`                       | Required | Filesystem directory used by the owning operation; see path rules.      |
| `repository`     | `string`                       | Required | Target host Git checkout.                                               |
| `destination`    | `string`                       | Required | See the linked contract and this family's rules for its interpretation. |
| `side`           | `"previous" \| "incoming"`     | Required | See the linked contract and this family's rules for its interpretation. |
| `maxBytes`       | `number \| undefined`          | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface RecoveryRestorePlan extends RecoveryRestoreOptions {
  readonly fingerprint: string;
  readonly manifestSha256: string;
  readonly commit: string;
  readonly payloads: readonly string[];
  readonly staging: "preserved" | "unavailable";
}
```

## Related contracts

- [RecoveryRestoreOptions](../recoveryrestoreoptions/)
