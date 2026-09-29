---
title: "Recover work"
description: "Find the work Outpost kept after a failure, restore it into a new directory and bring it back into your repository."
---

## What Outpost keeps

A failure never deletes the agent’s work. Outpost keeps it in the target repository’s `.outpost` directory or in your transport.

| What              | Where                                                | Kept when                                                                                                                   |
| ----------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Worktree          | `.outpost/workspaces/`                               | The run failed, integration conflicted, or the worktree is dirty, detached or holds ignored files (`node_modules`, copies). |
| Remote transfer   | `.outpost/recovery/`                                 | Changes from a [cloud sandbox](../cloud-sandboxes/) could not be applied to your checkout.                                  |
| Conversation      | `.outpost/conversations/` or the agent’s own store   | After each turn and on failure. See [Conversations](../conversations/).                                                     |
| Workflow progress | `.outpost/storage/` or your [transport](../storage/) | After each finished task. See [Durable runs](../durable-runs/).                                                             |

A retained worktree is an ordinary Git worktree on its branch: open it, commit what you keep and merge the branch.

## Read the error

[`recoveryDetails()`](../../reference/recoverydetails/) returns what Outpost attached to the error: `branch`, `directory`, `commits`, `transcript` and `logReference` when available.

```ts
import { dispatch, OutpostError, recoveryDetails } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

try {
  const result = await dispatch({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/upgrade-deps" },
    brief: { text: "Upgrade the test dependencies and commit the change." },
  });
  if (result.retainedDirectory) console.log("Kept:", result.retainedDirectory);
} catch (error) {
  console.error(recoveryDetails(error));
  if (error instanceof OutpostError) console.error(error.code, error.details);
  throw error;
}
```

Two failures also name their location in `error.details`. [Errors](../error-handling/) lists every code.

| Failure                             | Code        | Location                                    |
| ----------------------------------- | ----------- | ------------------------------------------- |
| Remote changes could not be applied | `workspace` | `details.recovery`: the transfer directory. |
| Automatic integration failed        | `conflict`  | `details.directory`: the kept worktree.     |

When the run itself also failed, the synchronization error arrives inside an `AggregateError`.

## Restore a remote transfer

A transfer holds two sides: `previous`, your checkout before the sandbox’s changes, and `incoming`, the sandbox’s changes. Restore one side into a new directory, never over your checkout.

<!-- flow -->

1. **Look**: Nothing is changed.
   - **Inspect**: List workspaces, locks and recorded sandbox activity.
     - `recovery inspect`
   - **Verify**: Check the transfer’s files, checksums and Git history.
     - `recovery verify`
2. **Restore**: Rebuild one side in a new directory.
   - **Plan**: Preview the commit and files to restore.
     - `recovery restore`
   - **Apply**: Create a detached checkout from the plan.
     - `--apply`
3. **Integrate**: You decide what comes back.
   - **Compare**: Review the restored checkout against your repository.
     - git
   - **Bring back**: Commit, cherry-pick or merge the parts you keep.
     - git

### Inspect

```sh
npx outpost recovery inspect --repository /projects/app --git --locks --resources
```

| Flag                   | Adds to the inventory                                              |
| ---------------------- | ------------------------------------------------------------------ |
| `--git`                | Branch, clean or dirty, detached `HEAD` and Git lock per worktree. |
| `--locks`              | Lock files and the PID that holds each one.                        |
| `--resources`          | Recorded sandbox activity and its ownership.                       |
| `--max-entries NUMBER` | A bound on scanned entries; the default is 100,000.                |
| `--json`               | The full report as JSON.                                           |

The command exits with status 1 when the inventory is incomplete.

### Verify

```sh
npx outpost recovery verify --directory "$TRANSFER" --checksums --restorability --repository /projects/app
```

`$TRANSFER` is the directory from `details.recovery`. `--checksums` compares each file with the transfer’s manifest; `--max-bytes` bounds the bytes hashed. `--restorability` rebuilds the commits and patches in a temporary clone of `--repository`. The command exits with status 1 when a check fails.

### Restore

```sh
npx outpost recovery restore --directory "$TRANSFER" --repository /projects/app \
  --destination /projects/app-recovered --side incoming
```

This prints the plan. Run it again with `--apply` to create the checkout: a clone of your repository detached at the restored commit, with the side’s patches and files applied and no `origin` remote.

| `--side`   | Restores                                                  | Staged index |
| ---------- | --------------------------------------------------------- | ------------ |
| `incoming` | The sandbox’s commits, uncommitted changes and new files. | Not restored |
| `previous` | Your checkout as it was before the transfer.              | Restored     |

The destination must not exist and must be outside the repository, its Git metadata and the transfer. The transfer stays in place.

### Compare and integrate

```sh
git -C /projects/app-recovered status
git -C /projects/app-recovered switch -c recovered
git -C /projects/app-recovered add -A
git -C /projects/app-recovered commit -m "Recover sandbox changes"
git -C /projects/app fetch /projects/app-recovered recovered:outpost/recovered
```

The work is now the `outpost/recovered` branch of your repository. Review it and merge it like any other branch.

## Recover from code

Each command has a function. `planRecoveryRestore()` returns the plan; `restoreRecoveryTransfer()` checks that nothing changed since and applies it.

```ts
import {
  inspectRecovery,
  planRecoveryRestore,
  restoreRecoveryTransfer,
  verifyRecoveryTransfer,
} from "@elie-laloum/outpost";

const repository = "/projects/app";
const transfer = process.env.TRANSFER!;

const inventory = await inspectRecovery({ repository, git: true, locks: true });
console.log(inventory.git?.workspaces);

const verification = await verifyRecoveryTransfer(transfer, {
  checksums: true,
  restorability: true,
  repository,
});
if (!verification.complete) throw new Error("The transfer failed verification");

const plan = await planRecoveryRestore({
  directory: transfer,
  repository,
  destination: "/projects/app-recovered",
  side: "incoming",
});
const restored = await restoreRecoveryTransfer(plan);
console.log(restored.directory, restored.commit);
```

`inspectRecovery({ transporter })` lists the objects of a [transport](../storage/) instead of a local repository.

## Archive a transfer remotely

`archiveRecovery()` verifies a transfer and uploads it through a transport. `materializeRecoveryArchive()` downloads it on any machine and checks its checksums again.

```ts
import {
  archiveRecovery,
  createLocalTransport,
  materializeRecoveryArchive,
} from "@elie-laloum/outpost";

const transporter = createLocalTransport({ directory: "/mnt/shared/outpost" });

const reference = await archiveRecovery({
  transporter,
  directory: process.env.TRANSFER!,
});

const staging = await materializeRecoveryArchive({
  transporter,
  reference,
  destination: "/projects/transfer-copy",
});
console.log(staging);
```

Keep `reference` (a key and a revision) to find the archive. Pass `staging` as `--directory` to `outpost recovery restore`, with a clone of the source repository.

## Release a stopped run or race

A crashed workflow or candidate race keeps ownership of its checkpoint. After stopping the old process, release it with `recoverWorkflowCheckpoint()` ([Durable runs](../durable-runs/)) or `recoverSpeculation()` ([Competing candidates](../speculation/)).

## Clean up afterwards

:::caution
Never delete `.outpost` or its folders by hand: they can hold the only copy of the agent’s work. Remove what you no longer need with [Retention and cleanup](../retention/).
:::

## Limits

- Checksums detect damage against an unsigned manifest; they do not prove who produced the transfer.
- Restorability covers commits, the bundle and patches, not submodules or external dependencies.
- A lock PID or recorded activity is an observation. It does not prove that a remote process has stopped.
- A worktree reported `clean` can still hold ignored files, such as copies or `node_modules`.
- An archive holds recovery files, not the repository: restoring still needs the source repository.

API: [recoveryDetails](../../reference/recoverydetails/) · [inspectRecovery](../../reference/inspectrecovery/) · [verifyRecoveryTransfer](../../reference/verifyrecoverytransfer/) · [planRecoveryRestore](../../reference/planrecoveryrestore/) · [restoreRecoveryTransfer](../../reference/restorerecoverytransfer/) · [archiveRecovery](../../reference/archiverecovery/) · [materializeRecoveryArchive](../../reference/materializerecoveryarchive/).
