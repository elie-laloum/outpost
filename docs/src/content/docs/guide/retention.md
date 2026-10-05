---
title: "Clean up stored data"
description: "Preview a retention policy and remove eligible runtime data while preserving recoverable work."
---

## Preview a policy

Start by previewing a retention policy. The report shows which runtime entries could be removed and which remain protected. Apply it only after reviewing the result.

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

Each candidate is checked again right before removal. One that changed since the plan stays, with reason `PLAN_CHANGED`. The output adds a `REMOVED` line per deleted entry.

```sh
npx outpost recovery prune --policy retention.json --repository /projects/app --apply
```

The command exits with status 1 when the inventory is incomplete, when what remains exceeds `maxBytes` or `maxWorkspaces`, or when a candidate could not be removed.

## Write the policy

API reference: [RecoveryRetentionPolicy](../../reference/recoveryretentionpolicy/).

`maxBytes` and `maxWorkspaces` never make more entries eligible: they tell you whether the policy frees enough space.

## Read why an entry stays

API reference: [RecoveryRetentionEntry](../../reference/recoveryretentionentry/).

## Prune from code

`planRecoveryRetention()` builds the same plan as the dry run. `pruneRecoveryRetention()` applies it and returns what it removed and kept.

```ts
import {
  planRecoveryRetention,
  pruneRecoveryRetention,
} from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";

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
import { repository } from "./outpost.config.ts";

await using reservation = await reserveRecoveryStorage({
  repository,
  maxBytes: 10 * 1024 ** 3,
  reserveBytes: 2 * 1024 ** 3,
});
// Write up to 2 GiB; the reservation is released at the end of the scope.
```

API reference: [RecoveryQuotaOptions](../../reference/recoveryquotaoptions/) and [RecoveryStorageReservationOptions](../../reference/recoverystoragereservationoptions/).

A refused reservation rejects with code `configuration`; a failed `assertRecoveryQuota()` rejects with code `workspace` ([Errors](../error-handling/)).

## Limits

- Reservations coordinate writers that use them. They are not a filesystem quota: any other process can still write to `.outpost`.
- A reservation whose process died stays in the ledger (`reservations/ledger` in the transport) and keeps counting. Remove its entry only after checking that its owner stopped, with a conditional write (`ifRevision`) through the same transport.
- Retention never removes branches, checkpoints, artifacts, conversations, recovery transfers or locks.
- A remote transport cannot use the `clean-workspaces` scope or `maxWorkspaces`.
- Do not delete `.outpost` by hand: it can hold the only copy of unfinished work.

API: [planRecoveryRetention](../../reference/planrecoveryretention/) · [pruneRecoveryRetention](../../reference/prunerecoveryretention/) · [RecoveryRetentionPolicy](../../reference/recoveryretentionpolicy/) · [RecoveryRetentionPlan](../../reference/recoveryretentionplan/) · [reserveRecoveryStorage](../../reference/reserverecoverystorage/) · [assertRecoveryQuota](../../reference/assertrecoveryquota/) · [WorkspaceOptions](../../reference/workspaceoptions/).
