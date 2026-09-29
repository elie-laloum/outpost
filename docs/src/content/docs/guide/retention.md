---
title: "Retention and cleanup"
description: "Preview and apply a retention policy that removes clean worktrees, closed journals and old cache entries, and reserve storage between cooperating writers."
---

## Preview a policy

A retention policy is a JSON file that says what may be removed and after how long. This one targets closed journals older than seven days:

```json title="retention.json"
{
  "version": 1,
  "scopes": ["closed-logs"],
  "minAgeMs": 604800000,
  "maxBytes": 1073741824
}
```

```sh
npx outpost recovery prune --policy retention.json --repository /projects/app
```

Without `--apply`, the command only prints its plan: one line per entry of `.outpost`, then the projected size.

```text
Outpost retention dry run — "/projects/app"
CANDIDATE "logs/5b0e…/index" | ELIGIBLE | 48213 bytes
RETAIN "/projects/app/.outpost/workspaces/fix-tests-3f9c2a61d0b4" | SCOPE_NOT_SELECTED | 18432 bytes
Observed 912004 logical bytes; projected 863791; projected quota within. Branches and recovery artifacts are retained.
```

`--json` prints `{ dryRun, plan }` instead. `--repository` defaults to the current directory.

## Apply it

```sh
npx outpost recovery prune --policy retention.json --repository /projects/app --apply
```

Each candidate is checked again right before removal. One that changed since the plan stays, with reason `PLAN_CHANGED`. The output adds a `REMOVED` line per deleted entry.

The command exits with status 1 when the inventory is incomplete, when what remains exceeds `maxBytes` or `maxWorkspaces`, or when a candidate could not be removed.

## Write the policy

| Field           | Required | Meaning                                                                                  |
| --------------- | -------- | ---------------------------------------------------------------------------------------- |
| `version`       | Yes      | Always `1`.                                                                              |
| `scopes`        | Yes      | One or more scopes from the table below. Nothing outside them is removed.                |
| `minAgeMs`      | Yes      | Minimum age, in milliseconds, since the entry's last modification. `0` accepts any age.  |
| `maxBytes`      | No       | Size limit checked on what remains after pruning. Above it, the plan reports `exceeded`. |
| `maxWorkspaces` | No       | Limit on the worktrees that remain after pruning. Above it, the plan reports `exceeded`. |

`maxBytes` and `maxWorkspaces` never make more entries eligible: they tell you whether the policy frees enough space.

| Scope              | Removes                                                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clean-workspaces` | Worktrees under `.outpost/workspaces` that are on a branch, without changes, untracked or ignored files, lock or recorded activity. The branch stays. |
| `closed-logs`      | [Journals](../journals/) whose writer closed them, with every segment older than `minAgeMs`.                                                          |
| `task-cache`       | [Result cache](../task-cache/) entries. The next run with that key executes the task again.                                                           |

## Read why an entry stays

| Reason                                                  | What it means                                                                                             |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `SCOPE_NOT_SELECTED`, `TASK_CACHE_NOT_SELECTED`         | The policy does not include this scope.                                                                   |
| `RETENTION_AGE`                                         | The worktree changed less than `minAgeMs` ago.                                                            |
| `RETENTION_AGE_OR_INCOMPLETE_INVENTORY`                 | The journal or cache entry is younger than `minAgeMs`, or the inventory is incomplete.                    |
| `DIRTY_WORKSPACE`, `IGNORED_FILES`                      | The worktree holds uncommitted, untracked or ignored files.                                               |
| `DETACHED_WORKSPACE`                                    | The worktree has no branch: its commits could be lost.                                                    |
| `OPERATION_LOCK_PRESENT`, `GIT_LOCKED_WORKSPACE`        | A task or Git owns the worktree.                                                                          |
| `RESOURCE_ACTIVITY_RECORDED`                            | A sandbox recorded activity on it.                                                                        |
| `LOG_ACTIVITY_OR_CONTENT_UNKNOWN`                       | The journal is still open or unreadable.                                                                  |
| `INCOMPLETE_INVENTORY`                                  | The inventory could not read everything, so nothing is removed.                                           |
| Other `*_UNKNOWN` reasons                               | Outpost could not establish the entry's state or owner.                                                   |
| `RECOVERY_DATA_PROTECTED`, `OWNERSHIP_RECORD_PROTECTED` | Checkpoints, artifacts, conversations, recovery transfers, reservations and locks. No scope removes them. |

## Prune from code

`planRecoveryRetention()` builds the same plan as the dry run. `pruneRecoveryRetention()` applies it and returns what it removed and kept.

```ts
import {
  planRecoveryRetention,
  pruneRecoveryRetention,
} from "@elie-laloum/outpost";
import { repository } from "./outpost.config.mts";

const plan = await planRecoveryRetention({
  repository,
  policy: {
    version: 1,
    scopes: ["clean-workspaces", "closed-logs", "task-cache"],
    minAgeMs: 7 * 24 * 60 * 60 * 1000,
  },
});
console.log(plan.quota, plan.projectedBytes);

const result = await pruneRecoveryRetention(plan);
console.log(result.removed, result.retained);
```

For data kept in a remote [transport](../storage/), pass `transporter` to `planRecoveryRetention()` and `{ transporter }` to `pruneRecoveryRetention()`. Only `closed-logs` and `task-cache` apply there.

## Clean what retention keeps

<!-- features -->

- **Named branches**: Pruning a worktree keeps its branch. Delete merged ones with `git branch -d outpost/fix-tests`.
- **Worktrees with changes**: Commit, copy or discard the files, after a look with [Recover work](../recovery/). `git -C <worktree> clean -fdX` deletes only ignored files.
- **Cache volumes**: They outlive sandboxes and images. Remove them with the container engine, label `io.outpost.cache=true` ([Prepare the environment](../environment-setup/)).

A worktree that became clean is removed by the next run of a `clean-workspaces` policy.

## Reserve storage between writers

A reservation claims bytes in `.outpost` before a job writes them. It is refused when current usage, active reservations and the new request exceed `maxBytes`.

```ts
import { reserveRecoveryStorage } from "@elie-laloum/outpost";
import { repository } from "./outpost.config.mts";

await using reservation = await reserveRecoveryStorage({
  repository,
  maxBytes: 10 * 1024 ** 3,
  reserveBytes: 2 * 1024 ** 3,
});
// Write up to 2 GiB; the reservation is released at the end of the scope.
```

<!-- features -->

- `storageQuota`: On `dispatch()` or `openWorkspace()`, holds the same reservation for the life of the workspace.
- `reserveRecoveryStorage()`: Holds a reservation until `release()` or the end of an `await using` scope.
- `assertRecoveryQuota()`: Checks current usage plus `reserveBytes` against `maxBytes` without reserving anything.

A refused reservation rejects with code `configuration`; a failed `assertRecoveryQuota()` rejects with code `workspace` ([Errors](../error-handling/)).

## Limits

- Reservations coordinate writers that use them. They are not a filesystem quota: any other process can still write to `.outpost`.
- A reservation whose process died stays in the ledger (`reservations/ledger` in the transport) and keeps counting. Remove its entry only after checking that its owner stopped.
- Retention never removes branches, checkpoints, artifacts, conversations, recovery transfers or locks.
- A remote transport cannot use the `clean-workspaces` scope or `maxWorkspaces`.
- Do not delete `.outpost` by hand: it can hold the only copy of unfinished work.

API: [planRecoveryRetention](../../reference/planrecoveryretention/) · [pruneRecoveryRetention](../../reference/prunerecoveryretention/) · [RecoveryRetentionPolicy](../../reference/recoveryretentionpolicy/) · [RecoveryRetentionPlan](../../reference/recoveryretentionplan/) · [reserveRecoveryStorage](../../reference/reserverecoverystorage/) · [assertRecoveryQuota](../../reference/assertrecoveryquota/) · [WorkspaceOptions](../../reference/workspaceoptions/).
