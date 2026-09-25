---
title: "RecoveryChecksumResult"
description: "RecoveryChecksumResult — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Purpose and behavior

Inspect retained work and plan explicit storage retention without discarding recoverable edits.

Planning does not prune. Application reacquires ownership and revalidates candidates. Quota checks observe usage rather than imposing physical filesystem limits.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name           | Type                                | Presence | Meaning                                                                 |
| -------------- | ----------------------------------- | -------- | ----------------------------------------------------------------------- |
| `integrity`    | `RecoveryIntegrity`                 | Required | See the linked contract and this family's rules for its interpretation. |
| `bytesChecked` | `number`                            | Required | See the linked contract and this family's rules for its interpretation. |
| `maxBytes`     | `number`                            | Required | See the linked contract and this family's rules for its interpretation. |
| `checks`       | `readonly RecoveryStructureCheck[]` | Required | See the linked contract and this family's rules for its interpretation. |

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
