---
title: "RecoveryVerification"
description: "RecoveryVerification — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryVerification**. See the [recovery and retention guide](../../guide/operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryVerification } from "@elie-laloum/outpost";
```

## Purpose and behavior

Inspect retained work and plan explicit storage retention without discarding recoverable edits.

Planning does not prune. Application reacquires ownership and revalidates candidates. Quota checks observe usage rather than imposing physical filesystem limits.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name        | Type                                               | Presence | Meaning                                                                 |
| ----------- | -------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `directory` | `string`                                           | Required | Filesystem directory used by the owning operation; see path rules.      |
| `scope`     | `"transfer-structure" \| "transfer-restorability"` | Required | See the linked contract and this family's rules for its interpretation. |
| `complete`  | `boolean`                                          | Required | See the linked contract and this family's rules for its interpretation. |
| `integrity` | `RecoveryIntegrity`                                | Required | See the linked contract and this family's rules for its interpretation. |
| `checksums` | `RecoveryChecksumResult \| undefined`              | Optional | See the linked contract and this family's rules for its interpretation. |
| `checks`    | `readonly RecoveryStructureCheck[]`                | Required | See the linked contract and this family's rules for its interpretation. |

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
