---
title: "Recovery commands"
description: "Inspect retained data before restoring or deleting it."
---

Inspect retained data before restoring or deleting it. The [recovery guide](../recovery/) explains the safe order; this page lists command options.

## `outpost recovery inspect`

Inspect the workspaces, retained transfers and recorded activity under a repository’s `.outpost`. This command reads the inventory without changing it.

```sh
outpost recovery inspect [--repository PATH | --runtime-directory PATH] [--max-entries N] [--git] [--locks] [--resources] [--json]
```

| Flag                  | Default                           | Values and effect                                              |
| --------------------- | --------------------------------- | -------------------------------------------------------------- |
| `--repository`        | Checkout of the current directory | Repository whose `.outpost` is listed.                         |
| `--runtime-directory` | None                              | Control directory for file workspaces; inspection without Git. |
| `--max-entries`       | `100000`                          | Stops the inventory after this many entries.                   |
| `--git`               | Off                               | Adds each workspace’s branch, HEAD and dirty state.            |
| `--locks`             | Off                               | Adds local lock PIDs and ownership.                            |
| `--resources`         | Off                               | Adds recorded sandbox activity.                                |
| `--json`              | Off                               | JSON report.                                                   |

It changes nothing. It exits `1` when the inventory is partial.

## `outpost recovery verify`

Verify a retained transfer before restoring it. You can compare checksums and test whether its patches apply in a temporary clone.

```sh
outpost recovery verify --directory TRANSFER [--checksums [--max-bytes N]] [--restorability --repository PATH] [--json]
```

| Flag              | Default  | Values and effect                                                      |
| ----------------- | -------- | ---------------------------------------------------------------------- |
| `--directory`     | Required | Retained transfer directory.                                           |
| `--checksums`     | Off      | Compares the files with the transfer’s checksum manifest.              |
| `--max-bytes`     | 1 GiB    | Bytes checked by `--checksums`, which it requires.                     |
| `--restorability` | Off      | Applies the transfer’s patches in a temporary clone of `--repository`. |
| `--repository`    | None     | Checkout used by `--restorability`; they go together.                  |
| `--json`          | Off      | JSON report.                                                           |

It changes no source files; restorability checks create a temporary clone. It exits `1` when a check fails or is incomplete.

## `outpost recovery restore`

Restore the saved host state or incoming sandbox changes into a new directory. Preview the plan first, then add `--apply` when you are ready to create the copy.

```sh
outpost recovery restore --directory TRANSFER --repository PATH --destination NEW_PATH --side previous|incoming [--max-bytes N] [--apply] [--json]
```

| Flag            | Default  | Values and effect                                                               |
| --------------- | -------- | ------------------------------------------------------------------------------- |
| `--directory`   | Required | Retained transfer directory.                                                    |
| `--repository`  | Required | Checkout the transfer belongs to.                                               |
| `--destination` | Required | New directory outside the repository; it must not exist.                        |
| `--side`        | Required | `previous` (host state before synchronization) or `incoming` (sandbox changes). |
| `--max-bytes`   | 1 GiB    | Largest retained payload accepted.                                              |
| `--apply`       | Off      | Creates the destination; without it, prints the plan.                           |
| `--json`        | Off      | JSON plan or result.                                                            |

The restored copy is a detached checkout. The transfer stays in place; review the copy before integrating it.

## `outpost recovery prune`

Preview the removals selected by your JSON retention policy. Add `--apply` to delete those entries after reviewing the plan.

```sh
outpost recovery prune --policy FILE [--repository PATH] [--apply] [--json]
```

| Flag           | Default                           | Values and effect                                         |
| -------------- | --------------------------------- | --------------------------------------------------------- |
| `--policy`     | Required                          | JSON policy file, up to 64 KiB ([format](../retention/)). |
| `--repository` | Checkout of the current directory | Repository whose `.outpost` is pruned.                    |
| `--apply`      | Off                               | Deletes the candidates; without it, a dry run.            |
| `--json`       | Off                               | JSON plan and result.                                     |

It exits `1` when the inventory is incomplete, the projected size exceeds the policy’s limit, or `--apply` had to keep a candidate. Branches and recovery artifacts are always kept.

## `outpost recovery publication`

Inspect an interrupted publication before choosing to finish it or reverse its writes. These commands do not replay tasks. Use the namespace and publication ID reported by the error.

```sh
outpost recovery publication inspect --runtime-directory .outpost --namespace documents --publication-id ID --json
outpost recovery publication finish --runtime-directory .outpost --namespace documents --publication-id ID --processes-stopped --json
outpost recovery publication rollback --runtime-directory .outpost --namespace documents --publication-id ID --processes-stopped --json
```

`--processes-stopped` asserts that you have stopped the owning processes; it does not stop them. `rollback` reverses only writes it can still recognize: it does not overwrite concurrent edits or undo writable-mount effects. Keep backups after a refusal.

To use a YAML project’s transport, add `--file recipe.yaml --config outpost.yaml`. With both options, `--run-id ID` also refreshes publication state in the matching recipe report, without authorizing task replay.

## `outpost recovery workspace`

Inspection returns the workspace state and revision. Stop its owner and release any remote allocation before recovery.

```sh
outpost recovery workspace inspect --runtime-directory .outpost --namespace documents --workspace-id ID --json
outpost recovery workspace recover --runtime-directory .outpost --namespace documents --workspace-id ID --revision REVISION --processes-stopped --allocation-released --json
```

`--revision` fences changes since inspection. `--adopt-files` explicitly accepts files from interrupted preparation; `--adopt-source` accepts a changed mounted source; `--portable` requests portable restoration. Do not add them to bypass a refusal without inspecting retained work. `--file` and `--config` select the YAML project transport. [Workflow resume](../durable-runs/) remains separate.

## `outpost recovery registry`

These commands inspect the local path coordination gate and release the inspected revision. Stop all processes using this registry before confirming.

```sh
outpost recovery registry inspect --json
outpost recovery registry recover --revision REVISION --processes-stopped --json
```
