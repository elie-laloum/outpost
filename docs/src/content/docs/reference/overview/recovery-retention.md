---
title: "Recovery and retention — Overview"
description: "Plan and prune retained Outpost data under a policy, check storage against a limit, and verify recovery transfers."
sidebar:
  label: Overview
  order: 0
---

## What a plan can remove

`planRecoveryRetention()` lists every entry of `.outpost`, or of a transport, and marks it eligible or kept with a reason code. An entry is eligible only when the whole inventory is complete.

| Data                                                                           | Eligible when                                                                                                                                                                 | Reason when kept                                                                  |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Worktrees in `.outpost/workspaces` (local only)                                | Scope `clean-workspaces`; registered, on a branch, no changes or untracked or ignored files, no Git lock, operation lock or recorded resource activity; older than `minAgeMs` | `SCOPE_NOT_SELECTED`, `DIRTY_WORKSPACE`, `DETACHED_WORKSPACE`, `RETENTION_AGE`, … |
| Journals                                                                       | Scope `closed-logs`; the index records the journal as closed; index and every segment older than `minAgeMs`                                                                   | `LOG_ACTIVITY_OR_CONTENT_UNKNOWN`, `RETENTION_AGE_OR_INCOMPLETE_INVENTORY`        |
| Task cache entries                                                             | Scope `task-cache`; older than `minAgeMs`                                                                                                                                     | `TASK_CACHE_NOT_SELECTED`, `RETENTION_AGE_OR_INCOMPLETE_INVENTORY`                |
| Recovery transfers, checkpoints, artifacts, conversations, reservations, locks | Never                                                                                                                                                                         | `RECOVERY_DATA_PROTECTED`, `OWNERSHIP_RECORD_PROTECTED`                           |
| Any entry of an incomplete inventory                                           | Never                                                                                                                                                                         | `INCOMPLETE_INVENTORY`; `quota` is `unknown`                                      |

:::note
`maxBytes` and `maxWorkspaces` never make more entries eligible. They only set `quota` to `exceeded` when `projectedBytes` or the worktrees left after pruning go above them.
:::

## What each call returns

| Call                                    | Result                                                                                            | Rejects                                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `planRecoveryRetention(options)`        | A plan with entries, `usageBytes`, `projectedBytes` and `quota`; removes nothing                  | Code `configuration` for an invalid policy, or `clean-workspaces`/`maxWorkspaces` with a `transporter` |
| `pruneRecoveryRetention(plan, options)` | `removed`, `retained` (`PLAN_CHANGED`, `REVALIDATION_OR_REMOVAL_FAILED`) and a fresh `after` plan | Code `configuration` for an incomplete plan or a `transporter` that does not match the plan’s `source` |
| `assertRecoveryQuota(options)`          | Resolves when observed usage plus `reserveBytes` fits in `maxBytes`; reserves nothing             | Code `workspace` when over the limit or the inventory is incomplete                                    |
| `verifyRecoveryTransfer(path, options)` | Per-file checks, `complete` and `integrity`; failed checks are reported, not thrown               | Code `configuration` for `restorability` without `repository`; `workspace` for a missing directory     |

Pruning checks each candidate again against a fresh plan, removes a worktree under its branch lock and keeps the branch, and deletes journal and cache objects with conditional writes.

## Entry points

Guide: [Recover work](../../../guide/recovery/) · [Retention and cleanup](../../../guide/retention/)

- [planRecoveryRetention](../../planrecoveryretention/)
- [pruneRecoveryRetention](../../prunerecoveryretention/)
- [assertRecoveryQuota](../../assertrecoveryquota/)
- [verifyRecoveryTransfer](../../verifyrecoverytransfer/)
- [RecoveryRetentionPolicy](../../recoveryretentionpolicy/)
- [RecoveryRetentionPlan](../../recoveryretentionplan/)
- [RecoveryRetentionEntry](../../recoveryretentionentry/)
- [RecoveryPruneResult](../../recoverypruneresult/)
- [RecoveryQuotaOptions](../../recoveryquotaoptions/)
- [RecoveryVerification](../../recoveryverification/)
