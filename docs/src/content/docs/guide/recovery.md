---
title: "Recover work"
description: "Inspect retained worktrees and transfers before restoring or cleaning them up."
---

## What Outpost keeps

When a run stops before its changes can be integrated, inspect the work Outpost retained. Use the recovery inventory to locate worktrees, downloaded transfers and backups before restoring or removing anything.

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
import { reportValue } from "./reporter.ts";
import { dispatch, OutpostError, recoveryDetails } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

try {
  const result = await dispatch({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/upgrade-deps" },
    brief: { text: "Upgrade the test dependencies and commit the change." },
  });
  if (result.retainedDirectory) reportValue("Kept:", result.retainedDirectory);
  // Example output: Kept: /project/.outpost/workspaces/…
} catch (error) {
  console.error(recoveryDetails(error));
  if (error instanceof OutpostError) console.error(error.code, error.details);
  throw error;
}
```

Two failures also name their location in `error.details`. [Errors](../error-handling/) lists every code.

API reference: [recoveryDetails](../../reference/recoverydetails/).

When the run itself also failed, the synchronization error arrives inside an `AggregateError`.

## Restore a remote transfer

A transfer holds two sides: `previous`, your checkout before the sandbox’s changes, and `incoming`, the sandbox’s changes. Restore one side into a new directory, never over your checkout.

<!-- canvas -->

- **Look**: Nothing is changed.
  - Steps
  - **Inspect**: List workspaces, locks and recorded sandbox activity.
    - `recovery inspect`
  - **Verify**: Check the transfer’s files, checksums and Git history.
    - `recovery verify`
  - → **Restore**: then
- **Restore**: Rebuild one side in a new directory.
  - Steps
  - **Plan**: Preview the commit and files to restore.
    - `recovery restore`
  - **Apply**: Create a detached checkout from the plan.
    - `--apply`
  - → **Integrate**: then
- **Integrate**: You decide what comes back.
  - Steps
  - **Compare**: Review the restored checkout against your repository.
    - git
  - **Bring back**: Commit, cherry-pick or merge the parts you keep.
    - git

### Inspect

```sh
npx outpost recovery inspect --repository /projects/app --git --locks --resources
```

API reference: [RecoveryInspectionOptions](../../reference/recoveryinspectionoptions/).

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

API reference: [RecoveryRestoreOptions](../../reference/recoveryrestoreoptions/).

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

<!-- tabs -->

```ts title="recovery-target.ts"
export const repository = "/projects/app";
export const transfer = process.env.TRANSFER!;
```

```ts title="verify-transfer.ts"
import { reportValue } from "./reporter.ts";
import { inspectRecovery, verifyRecoveryTransfer } from "@elie-laloum/outpost";
import { repository, transfer } from "./recovery-target.ts";

export async function verifyTransfer() {
  const inventory = await inspectRecovery({
    repository,
    git: true,
    locks: true,
  });
  reportValue(inventory.git?.workspaces);
  // Example output: [ { branch: "outpost/fix-tests", … } ]
  const verification = await verifyRecoveryTransfer(transfer, {
    checksums: true,
    restorability: true,
    repository,
  });
  if (!verification.complete)
    throw new Error("The transfer failed verification");
}
```

```ts title="restore.ts"
import { reportValue } from "./reporter.ts";
import { verifyTransfer } from "./verify-transfer.ts";
import {
  planRecoveryRestore,
  restoreRecoveryTransfer,
} from "@elie-laloum/outpost";
import { transfer, repository } from "./recovery-target.ts";

await verifyTransfer();
export const plan = await planRecoveryRestore({
  directory: transfer,
  repository,
  destination: "/projects/app-recovered",
  side: "incoming",
});
export const restored = await restoreRecoveryTransfer(plan);
reportValue(restored.directory, restored.commit);
// Example output: /project/.outpost/workspaces/… 8f3a21c…
```

`inspectRecovery({ transporter })` lists the objects of a [transport](../storage/) instead of a local repository.

## Archive a transfer remotely

`archiveRecovery()` verifies a transfer and uploads it through a transport. `materializeRecoveryArchive()` downloads it on any machine and checks its checksums again.

```ts
import { reportValue } from "./reporter.ts";
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
reportValue(staging);
// Example output: /project/.outpost/recovery/run-1
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
- A transfer is restorable only once the host backup ran: a synchronization that failed during download or validation leaves no `state.json`, and the restore plan rejects it.
- A lock PID or recorded activity is an observation. It does not prove that a remote process has stopped.
- A worktree reported `clean` can still hold ignored files, such as copies or `node_modules`.
- An archive holds recovery files, not the repository: restoring still needs the source repository.

API: [recoveryDetails](../../reference/recoverydetails/) · [inspectRecovery](../../reference/inspectrecovery/) · [verifyRecoveryTransfer](../../reference/verifyrecoverytransfer/) · [planRecoveryRestore](../../reference/planrecoveryrestore/) · [restoreRecoveryTransfer](../../reference/restorerecoverytransfer/) · [archiveRecovery](../../reference/archiverecovery/) · [materializeRecoveryArchive](../../reference/materializerecoveryarchive/).

## File workspaces

For directory and ephemeral resources, inspect `recovery inspect --runtime-directory PATH`. Publication `inspect`, `finish` and `rollback` operate on their own journal without rerunning workflow tasks. Writable mount effects remain immediate and have no publication rollback. See [file recovery](../workspaces/#check-capabilities-and-recover-publication).
