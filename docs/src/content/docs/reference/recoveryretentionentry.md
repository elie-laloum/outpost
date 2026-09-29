---
title: "RecoveryRetentionEntry"
description: "RecoveryRetentionEntry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryRetentionEntry } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                                     | Presence | Meaning                                                                                                                                                 |
| ------------ | ---------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `revision`   | `string \| undefined`                    | Optional | Transport revision of the object, or of a journal's index; deletion is conditional on it.                                                               |
| `objects`    | `readonly TransportEntry[] \| undefined` | Optional | Versioned objects removed with the entry: a journal's index and segments, or one cache object. Each is deleted only at its recorded revision.           |
| `path`       | `string`                                 | Required | Host path of a .outpost entry, or an object key for journals, cache entries and every entry of a transport plan.                                        |
| `category`   | `string`                                 | Required | Storage category, such as workspaces, logs, task-cache, recovery, locks or checkpoints.                                                                 |
| `bytes`      | `number`                                 | Required | Bytes of the entry: file sizes of a directory, or the index and segments of a journal.                                                                  |
| `eligible`   | `boolean`                                | Required | Whether pruneRecoveryRetention() will try to remove the entry; true only when reason is ELIGIBLE.                                                       |
| `reason`     | `string`                                 | Required | ELIGIBLE or the code that keeps the entry, such as SCOPE_NOT_SELECTED, RETENTION_AGE, DIRTY_WORKSPACE, INCOMPLETE_INVENTORY or RECOVERY_DATA_PROTECTED. |
| `branch`     | `string \| undefined`                    | Optional | Branch checked out in a registered worktree; pruning requires it unchanged and keeps it.                                                                |
| `head`       | `string \| undefined`                    | Optional | HEAD commit of a registered worktree; pruning requires it unchanged.                                                                                    |
| `modifiedAt` | `string \| undefined`                    | Optional | ISO timestamp of the latest modification inside the entry, compared with minAgeMs.                                                                      |

## Signature

```ts
export interface RecoveryRetentionEntry {
  readonly revision?: string;
  readonly objects?: readonly TransportEntry[];
  readonly path: string;
  readonly category: string;
  readonly bytes: number;
  readonly eligible: boolean;
  readonly reason: string;
  readonly branch?: string;
  readonly head?: string;
  readonly modifiedAt?: string;
}
```

## Related contracts

- [TransportEntry](../transportentry/)
