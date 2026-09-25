---
title: "RecoveryRestoreResult"
description: "RecoveryRestoreResult — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryRestoreResult**. See the [recovery restoration guide](../../guide/operations/recovery-restoration/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryRestoreResult } from "@elie-laloum/outpost";
```

## Purpose and behavior

Plan then apply a retained transfer into a new destination for review.

Restore into a new directory and inspect before integration. Verification checks recorded structure and integrity; it does not authenticate the author.

[Complete example and detailed rules](../../guide/operations/recovery-restoration/).

## Parameters and properties

| Name             | Type                           | Presence | Meaning                                                                 |
| ---------------- | ------------------------------ | -------- | ----------------------------------------------------------------------- |
| `directory`      | `string`                       | Required | Filesystem directory used by the owning operation; see path rules.      |
| `commit`         | `string`                       | Required | See the linked contract and this family's rules for its interpretation. |
| `side`           | `"previous" \| "incoming"`     | Required | See the linked contract and this family's rules for its interpretation. |
| `staging`        | `"unavailable" \| "preserved"` | Required | See the linked contract and this family's rules for its interpretation. |
| `sourceRetained` | `true`                         | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface RecoveryRestoreResult {
  readonly directory: string;
  readonly commit: string;
  readonly side: "previous" | "incoming";
  readonly staging: "preserved" | "unavailable";
  readonly sourceRetained: true;
}
```
