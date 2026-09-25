---
title: "RecoveryInspection"
description: "RecoveryInspection — Outpost API"
sidebar:
  order: 10
---

Public contract for **RecoveryInspection**. See the [resource activity guide](../../guide/operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import type { RecoveryInspection } from "@elie-laloum/outpost";
```

## Purpose and behavior

Read locally recorded lease and operation activity.

Local observations do not enumerate remote accounts and are not an authoritative cloud inventory.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name             | Type                                  | Presence | Meaning                                                                 |
| ---------------- | ------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `repository`     | `string`                              | Required | Target host Git checkout.                                               |
| `activity`       | `"unverified"`                        | Required | See the linked contract and this family's rules for its interpretation. |
| `git`            | `WorkspaceGitInspection \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `locks`          | `LockInspection \| undefined`         | Optional | See the linked contract and this family's rules for its interpretation. |
| `resources`      | `ResourceInspection \| undefined`     | Optional | See the linked contract and this family's rules for its interpretation. |
| `root`           | `string`                              | Required | See the linked contract and this family's rules for its interpretation. |
| `categories`     | `readonly StorageCategory[]`          | Required | See the linked contract and this family's rules for its interpretation. |
| `usage`          | `Readonly<StorageUsage>`              | Required | Reported usage counters; not a currency estimate.                       |
| `issues`         | `readonly StorageIssue[]`             | Required | See the linked contract and this family's rules for its interpretation. |
| `complete`       | `boolean`                             | Required | See the linked contract and this family's rules for its interpretation. |
| `scannedEntries` | `number`                              | Required | See the linked contract and this family's rules for its interpretation. |
| `maxEntries`     | `number`                              | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface RecoveryInspection extends StorageInventory {
  readonly repository: string;
  readonly activity: "unverified";
  readonly git?: WorkspaceGitInspection;
  readonly locks?: LockInspection;
  readonly resources?: ResourceInspection;
}
```

## Related contracts

- [LockInspection](../support-lockinspection/)
- [ResourceInspection](../resourceinspection/)
- [StorageInventory](../support-storageinventory/)
- [WorkspaceGitInspection](../support-workspacegitinspection/)
