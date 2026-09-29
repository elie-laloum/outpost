---
title: "RecoveryRestorePlan"
description: "RecoveryRestorePlan — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryRestorePlan } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                           | Presence | Meaning                                                                                                                                                                        |
| ---------------- | ------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fingerprint`    | `string`                       | Required | SHA-256 of every other plan field. restoreRecoveryTransfer() rejects a plan that no longer matches it.                                                                         |
| `manifestSha256` | `string`                       | Required | SHA-256 of the transfer's checksums.json at planning. Restoration rejects with code configuration when the manifest has changed.                                               |
| `commit`         | `string`                       | Required | Commit the destination will be detached at: the last synchronized commit for previous, the sandbox HEAD for incoming.                                                          |
| `payloads`       | `readonly string[]`            | Required | Untracked file paths, relative to the checkout, copied from previous-files/ or incoming/ into the destination after the patches.                                               |
| `staging`        | `"unavailable" \| "preserved"` | Required | preserved for previous: the staged changes are restored to the index. unavailable for incoming: the sandbox's staging is not captured.                                         |
| `directory`      | `string`                       | Required | Retained transfer directory, as named by details.recovery of the synchronization error. It must contain state.json and checksums.json.                                         |
| `repository`     | `string`                       | Required | Host Git repository cloned into the destination; it is only read. Partial, shallow or alternates-based repositories fail the Git check.                                        |
| `destination`    | `string`                       | Required | New directory to create. Its parent must exist; the path must not exist and must lie outside the repository, its Git metadata and the transfer.                                |
| `side`           | `"previous" \| "incoming"`     | Required | previous restores the host worktree as backed up before the transfer, staged index included; incoming restores the sandbox's commits, uncommitted changes and untracked files. |
| `maxBytes`       | `number \| undefined`          | Optional | Maximum transfer bytes copied and hashed, default 1073741824 (1 GiB). Exceeding it rejects with code configuration.                                                            |

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
