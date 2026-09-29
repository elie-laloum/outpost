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

Check a retained transfer against its repository and return a plan to restore one side into a new directory. It checks a checksum-verified temporary copy of the transfer and creates nothing. Invalid options and failed checks reject with code configuration; a missing transfer, repository or destination parent rejects with code workspace.

[Complete example and detailed rules](../../guide/recovery/).

## Parameters and properties

| Name                  | Type                          | Presence | Meaning                                                                                                                                                                        |
| --------------------- | ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`             | `RecoveryRestoreOptions`      | Required | Retained transfer source, repository, new destination, selected side and verification byte bound.                                                                              |
| `options.directory`   | `string`                      | Required | Retained transfer directory, as named by details.recovery of the synchronization error. It must contain state.json and checksums.json.                                         |
| `options.repository`  | `string`                      | Required | Host Git repository cloned into the destination; it is only read. Partial, shallow or alternates-based repositories fail the Git check.                                        |
| `options.destination` | `string`                      | Required | New directory to create. Its parent must exist; the path must not exist and must lie outside the repository, its Git metadata and the transfer.                                |
| `options.side`        | `"previous" \| "incoming"`    | Required | previous restores the host worktree as backed up before the transfer, staged index included; incoming restores the sandbox's commits, uncommitted changes and untracked files. |
| `options.maxBytes`    | `number \| undefined`         | Optional | Maximum transfer bytes copied and hashed, default 1073741824 (1 GiB). Exceeding it rejects with code configuration.                                                            |
| `observation`         | `ObservationHub \| undefined` | Optional | Hub that receives the recovery operation restore.plan when it starts, finishes or fails.                                                                                       |

## Returns

`Promise<RecoveryRestorePlan>`

## Signature

```ts
export declare function planRecoveryRestore(
  options: RecoveryRestoreOptions,
  observation?: ObservationHub,
): Promise<RecoveryRestorePlan>;
```

## Related contracts

- [ObservationHub](../observationhub/)
- [RecoveryRestoreOptions](../recoveryrestoreoptions/)
- [RecoveryRestorePlan](../recoveryrestoreplan/)
