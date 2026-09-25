---
title: Restore a retained transfer
description: Plan and reconstruct previous or incoming repository state in a separate checkout.
sidebar:
  order: 3
---

After [inspecting recovery data](../../../operations/recovery/) and [verifying the retained transfer](../../../operations/recovery-verification/), choose the state to reconstruct. Restoration creates an independent Git checkout in a new directory outside the source repository, Git metadata and transfer. Its parent directory must already exist. Existing destinations, including empty directories and symlinks, are refused.

```sh
outpost recovery restore --directory /recovery/session/transfer --repository /projects/repository --destination /projects/restored --side previous --json
outpost recovery restore --directory /recovery/session/transfer --repository /projects/repository --destination /projects/restored --side previous --apply
```

Without `--apply`, the command builds a plan and leaves the destination absent. Each invocation verifies a private snapshot of the transfer against its recorded SHA-256 manifest and checks Git objects and patch applicability in isolation. `--apply` repeats those checks before exclusively creating the destination. Another process creating that path prevents restoration. The original checkout, index, branch registrations and recovery artifacts remain unchanged.

| Selection         | Restored state                                                                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--side previous` | The recorded previous commit, working-tree patch, index patch and previous untracked payloads. Staged and unstaged changes remain separate, including different edits to the same file.                            |
| `--side incoming` | The recorded incoming commit, remote working-tree patch and incoming payloads. Remote staging was not captured by the transfer format, so changes remain unstaged and the result reports `staging: "unavailable"`. |

Binary payloads, supported file modes and leaf symlinks are preserved. Payloads cannot replace an existing restored path or traverse a symlink parent. Restoration stops on conflicts; it never overwrites the source checkout. The resulting checkout has a detached HEAD and no `origin` remote. Review its diff and create a branch before explicitly integrating its changes with the original repository.

If restoration fails after creating the destination, the error identifies that partial checkout. It and the original transfer are retained for inspection. Only the private temporary verification snapshot is removed. Choose another destination for a retry or explicitly inspect and remove the partial checkout yourself.

## Plan and apply through the API

```ts
import {
  planRecoveryRestore,
  restoreRecoveryTransfer,
} from "@elie-laloum/outpost";

const plan = await planRecoveryRestore({
  directory: "/recovery/session/transfer",
  repository: "/projects/repository",
  destination: "/projects/restored",
  side: "previous",
});
console.log(plan.commit, plan.payloads, plan.staging);
// Apply the reviewed plan explicitly.
const restored = await restoreRecoveryTransfer(plan);
console.log(restored.directory, restored.sourceRetained);
```

The plan binds canonical paths, side, commit, payload list, byte limit and manifest fingerprint. Application rejects modified plans and transfers whose manifest or covered bytes changed. A JSON round trip preserves the plan; it contains no raw file contents. The CLI creates a fresh plan on each invocation, while the API lets you hold and apply the same reviewed plan.

## Scope and limits

A complete transfer with `checksums.json` is required. Missing manifests, malformed metadata, corrupt payloads, unavailable commits and invalid patches fail before destination creation. The source repository must supply any objects not contained in the bundle. Shallow, partial/promisor and alternate-object repositories are unsupported. Git operations disable inherited Git overrides, global/system configuration, hooks, fsmonitor and automatic maintenance; cloning uses independent objects and performs no network fetch.

The default checksum and snapshot payload budget is 1 GiB; `maxBytes` or `--max-bytes` changes it. Metadata reads are separately bounded. Git clone and checkout disk usage is outside this budget. The unsigned manifest checks bytes, entry types and symlink text; it does not authenticate the source or certify file permissions or consistent capture. Work from trusted recovery data and stop the failed producer before recovery.

This operation reconstructs the repository state captured by one transfer. Ignored files that were not captured, parent-session artifacts, native agent conversations, submodule repositories, external dependencies, provider sessions and credentials are not reconstructed. No host merge, automatic push or provider restart occurs.
