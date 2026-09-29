---
title: "RecoveryRestoreOptions"
description: "RecoveryRestoreOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryRestoreOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                       | Presence | Meaning                                                                                                                                                                        |
| ------------- | -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `directory`   | `string`                   | Required | Retained transfer directory, as named by details.recovery of the synchronization error. It must contain state.json and checksums.json.                                         |
| `repository`  | `string`                   | Required | Host Git repository cloned into the destination; it is only read. Partial, shallow or alternates-based repositories fail the Git check.                                        |
| `destination` | `string`                   | Required | New directory to create. Its parent must exist; the path must not exist and must lie outside the repository, its Git metadata and the transfer.                                |
| `side`        | `"previous" \| "incoming"` | Required | previous restores the host worktree as backed up before the transfer, staged index included; incoming restores the sandbox's commits, uncommitted changes and untracked files. |
| `maxBytes`    | `number \| undefined`      | Optional | Maximum transfer bytes copied and hashed, default 1073741824 (1 GiB). Exceeding it rejects with code configuration.                                                            |

## Signature

```ts
export interface RecoveryRestoreOptions {
  readonly directory: string;
  readonly repository: string;
  readonly destination: string;
  readonly side: "previous" | "incoming";
  readonly maxBytes?: number;
}
```
