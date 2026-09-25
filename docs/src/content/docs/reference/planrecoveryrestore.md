---
title: "planRecoveryRestore"
description: "planRecoveryRestore — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { planRecoveryRestore } from "@elie-laloum/outpost";
```

## Purpose and behavior

Validate a retained transfer and prepare restoration of its previous or incoming side into a new destination. The plan records payloads, commit and fingerprints for later revalidation; it does not populate the destination.

[Complete example and detailed rules](../../guide/operations/recovery-restoration/).

## Parameters and properties

| Name                  | Type                       | Presence | Meaning                                                                                              |
| --------------------- | -------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `options`             | `RecoveryRestoreOptions`   | Required | Retained transfer source, repository, new destination, selected side and verification byte bound.    |
| `options.directory`   | `string`                   | Required | Host directory containing the retained transfer artifacts to verify or restore.                      |
| `options.repository`  | `string`                   | Required | Target host Git checkout.                                                                            |
| `options.destination` | `string`                   | Required | New, absent destination directory outside the source repository, Git metadata and retained transfer. |
| `options.side`        | `"previous" \| "incoming"` | Required | Retained state to restore: previous host state or incoming remote state.                             |
| `options.maxBytes`    | `number \| undefined`      | Optional | Maximum retained payload bytes allowed when snapshotting and verifying restoration sources.          |

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
