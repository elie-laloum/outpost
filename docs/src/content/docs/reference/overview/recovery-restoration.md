---
title: "Recovery restoration — Overview"
description: "Rebuild one side of a retained remote transfer in a new directory, after checking its files, checksums and Git history."
sidebar:
  label: Overview
  order: 0
---

## Choose a side

A transfer stays under `.outpost/recovery` when a cloud sandbox’s changes could not be applied to the host worktree; the `workspace` error names it in `details.recovery`. It holds both sides of that synchronization.

| `side`     | Commit                                | Uncommitted changes                           | Staged index                                         | Untracked files   |
| ---------- | ------------------------------------- | --------------------------------------------- | ---------------------------------------------------- | ----------------- |
| `previous` | Last synchronized commit              | `previous.patch`: the host worktree’s changes | Restored from `previous-index.patch` (`"preserved"`) | `previous-files/` |
| `incoming` | Sandbox `HEAD`, from `commits.bundle` | `remote.patch`: the sandbox’s changes         | Not captured (`"unavailable"`)                       | `incoming/`       |

## How a restore ends

Neither call writes to the host repository or the transfer. Each copies the transfer to a temporary directory and checks the copy like `verifyRecoveryTransfer()` with checksums and restorability.

| Event                                                                              | Outcome                                                            | Destination                                    |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| `planRecoveryRestore()` passes every check                                         | Resolves with a `RecoveryRestorePlan`                              | Not created                                    |
| Destination exists or lies inside the repository, its Git metadata or the transfer | Rejects with code `configuration`                                  | Not created                                    |
| Byte limit reached, checksum mismatch or failed Git check                          | Rejects with code `configuration`                                  | Not created                                    |
| Transfer, repository or destination parent missing                                 | Rejects with code `workspace`                                      | Not created                                    |
| Transfer has no `state.json`: synchronization failed before the host backup        | Rejects with a filesystem error                                    | Not created                                    |
| Plan edited, or transfer changed since planning                                    | `restoreRecoveryTransfer()` rejects with code `configuration`      | Not created                                    |
| Clone, bundle, patch or file copy fails                                            | Rejects with code `workspace`, naming `destination` and `transfer` | Partial, kept                                  |
| `restoreRecoveryTransfer()` completes                                              | Resolves with a `RecoveryRestoreResult`, `sourceRetained: true`    | Clone detached at `commit`, no `origin` remote |

:::caution
A failed restore keeps its partial destination, and a retry into the same path is refused. Remove it or choose a new destination.
:::

## Entry points

Guide: [Recover work](../../../guide/recovery/) · [Cloud sandboxes](../../../guide/cloud-sandboxes/)

- [planRecoveryRestore](../../planrecoveryrestore/)
- [restoreRecoveryTransfer](../../restorerecoverytransfer/)
- [RecoveryRestoreOptions](../../recoveryrestoreoptions/)
- [RecoveryRestorePlan](../../recoveryrestoreplan/)
- [RecoveryRestoreResult](../../recoveryrestoreresult/)
- [RecoveryChecksumResult](../../support-recoverychecksumresult/)
- [StorageInventory](../../support-storageinventory/)
- [WorkspaceGitInspection](../../support-workspacegitinspection/)
- [LockInspection](../../support-lockinspection/)
