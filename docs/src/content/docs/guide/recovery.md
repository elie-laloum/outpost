---
title: "Recover work"
description: "Inspect preserved state before restoring work."
---

When synchronization or integration fails, inspect the reported `retainedDirectory` and recovery details before deleting anything. Preserved data may contain the only copy of the agent’s work.

## Inspect

```sh
npx outpost recovery inspect --repository /projects/app --git --locks --resources --json
```

The report inventories local workspaces, ownership and activity. A remote activity record is an observation; its PID does not prove whether a remote process is alive.

## Verify a transfer

```sh
npx outpost recovery verify --directory /path/to/transfer --checksums --restorability --repository /projects/app
```

Verification checks the retained material and optionally its checksums and restorability. It does not apply changes to the original checkout.

## Restore into a new directory

```sh
npx outpost recovery restore --directory /path/to/transfer --repository /projects/app --destination /projects/recovered --side incoming
```

This previews the plan. Add `--apply` after reviewing it. Choose `previous` to restore the backed-up side. The destination must meet the restoration contract; use a fresh directory and compare the recovered state before integrating it.

For remote archives, `materializeRecoveryArchive()` restores staging first. `archiveRecovery()` publishes verified recovery payloads through a transport. Keep the archive and local staging until recovery is complete.

API: [inspectRecovery](../../reference/inspectrecovery/) · [verifyRecoveryTransfer](../../reference/verifyrecoverytransfer/) · [restoreRecoveryTransfer](../../reference/restorerecoverytransfer/) · [archiveRecovery](../../reference/archiverecovery/).
