---
title: "Retention and quotas"
description: "Plan explicit cleanup and check storage budgets."
sidebar:
  order: 3
---

Start by [inspecting retained data](../../../operations/recovery/).

## Plan retention and prune explicitly

Retention is opt-in. Save a policy such as `retention.json` outside the managed storage directories:

```json
{
  "version": 1,
  "scopes": ["clean-workspaces", "closed-logs"],
  "minAgeMs": 604800000,
  "maxBytes": 1073741824,
  "maxWorkspaces": 10
}
```

`minAgeMs` is a minimum observed age in milliseconds; `maxBytes` and `maxWorkspaces` are optional nonnegative quota targets. All eligible entries older than the minimum age are candidates, even when usage is already below the targets. Omitting a scope protects that category. Unknown fields, unsupported scopes and invalid limits are rejected.

```sh
outpost recovery prune --repository /path/to/repository --policy retention.json
outpost recovery prune --repository /path/to/repository --policy retention.json --json
outpost recovery prune --repository /path/to/repository --policy retention.json --apply
```

The default is a dry run. `--apply` creates a fresh plan and revalidates each candidate before removal. The library also accepts a previously reviewed plan through `pruneRecoveryRetention(plan)`; changed candidates are retained. A plan reports each entry's category, observed logical size, eligibility and reason, plus total and projected usage. Recovery artifacts and ownership records are always explicitly protected and count against the byte target. The inventory covers the four standard `.outpost` categories; custom external logs, native conversation stores, engine-managed cache volumes and Git's shared object database are outside it.

`clean-workspaces` requires a registered, attached, clean worktree without ignored files, Git locks or Outpost operation locks. Dirty, detached, unregistered, unreadable and unknown workspaces remain protected. Pruning acquires the branch's normal Outpost lock, checks branch/HEAD/status again, then uses non-forced Git worktree removal. Every branch is retained, including unpublished commits. Consequently removing a worktree does not promise to reclaim its Git objects. Ordinary workspace disposal also preserves ignored files.

`closed-logs` accepts only default journals written by the new implementation and closed successfully. They receive a private `.jsonl.closed.json` marker recording an unsigned SHA-256 fingerprint, size, close time and filesystem identity. Planning reads at most 4 KiB of marker metadata and hashes at most 1 GiB per log; larger, modified, replaced, unclosed, legacy and custom logs stay protected. Journal reopening invalidates the old marker. Pruning acquires the same journal lock used by writers and revalidates the marker before deleting the log and its marker. These records assume a trusted repository and cooperating Outpost processes; someone able to rewrite both data and metadata can forge them. External filesystem writers are not fenced by Outpost locks.

Incomplete inventories fail closed: they never permit pruning and report quota `unknown`. A complete plan reports projected quota `within` or `exceeded`; protected data can make a quota impossible to meet. Dry run exits with `1` for incomplete/over-quota plans. Apply also exits with `1` if any candidate changed or could not be removed. This is explicit retention, not background eviction or an allocation reservation. No recovery backup, lock or Git branch is automatically deleted to satisfy a quota.

## Check storage admission in a workflow

The public API lets a workflow enforce a byte limit before it allocates another resource:

```ts
import {
  assertRecoveryQuota,
  planRecoveryRetention,
} from "@elie-laloum/outpost";

const repository = "/path/to/repository";
await assertRecoveryQuota({
  repository,
  maxBytes: 1_073_741_824,
  reserveBytes: 104_857_600,
});
const plan = await planRecoveryRetention({
  repository,
  policy: { version: 1, scopes: ["closed-logs"], minAgeMs: 604_800_000 },
});
console.log(plan.usageBytes, plan.projectedBytes, plan.quota);
```

Admission throws an `OutpostError` when observed storage plus the caller's proposed `reserveBytes` exceeds `maxBytes`, or when inventory is incomplete. It includes all four categories, including protected entries. It does not reserve bytes, enforce a physical disk quota or automatically run inside `dispatch`/provider allocation. Use `reserveRecoveryStorage` below when several writers share a budget. `maxEntries` bounds inventory work and partial scans never count as successful admission.

## Reserve capacity across concurrent operations

`reserveRecoveryStorage` serializes admission for cooperating processes using the same repository checkout. It charges measured local storage, existing reservations, the requested headroom and reservation metadata before recording ownership. All participants should use the same `maxBytes` budget.

```ts
import { reserveRecoveryStorage } from "@elie-laloum/outpost";

const repository = "/path/to/repository";
await using reservation = await reserveRecoveryStorage({
  repository,
  maxBytes: 1_073_741_824,
  reserveBytes: 104_857_600,
});
// Perform custom work while the reservation remains owned.
// Explicit reservation.release() is also supported and idempotent.
```

For automatic ownership, set `storageQuota` on `openWorkspace`, `createSandbox`, `dispatch` or an isolated task's sandbox options:

```ts
import { openWorkspace } from "@elie-laloum/outpost";

await using workspace = await openWorkspace({
  repository: "/path/to/repository",
  branch: { mode: "named", name: "reserved-work" },
  storageQuota: {
    maxBytes: 1_073_741_824,
    reserveBytes: 104_857_600,
  },
});
```

Reservation happens before workspace allocation. Allocation and startup failures release it; a successful workspace retains it until `close()`, including between warm sandbox operations. A supplied workspace owns its quota: configure the workspace itself, rather than passing another quota to its sandbox. Closing a sandbox that borrows the workspace does not release that workspace's reservation. Use either automatic ownership or a manual reservation for the same work to avoid reserving twice.

Reservations represent headroom, not consumed-byte counters: their entire amount remains charged alongside current measured storage until release. This conservative accounting can refuse admission before the physical disk is full. Closing a workspace releases the claim even when dirty files are retained; those files continue counting as measured storage. No cleanup or eviction is performed to make admission fit.

Private versioned records live in `.outpost/locks/storage-reservations/` and count in the existing protected locks category. Admission waits up to five seconds for repository ownership and accepts an abort signal. Incomplete storage inventories, corrupt records and unsafe record paths refuse admission. Active and uncertain owners remain charged. On a later admission, a record is reclaimed only when local process identity proves that its owner exited. This automatic crash recovery currently requires Linux process identity; unknown hosts, boots, PID namespaces, reused PIDs and platforms without that identity retain their claims for operator investigation. An unreadable or interrupted ownership-lock write also fails closed. Never delete an uncertain record until its owner is independently confirmed stopped.

These are logical local storage reservations for cooperating Outpost callers, not filesystem quotas. They do not prevent a running command or unrelated filesystem writer from exceeding its estimate, and they do not include cloud disks, container cache volumes, shared Git objects or external transcript stores. The original `assertRecoveryQuota` remains a snapshot check and creates no claim; use reservations for concurrent admission.
