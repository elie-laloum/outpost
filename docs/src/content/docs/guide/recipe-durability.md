---
title: "Save and resume a recipe"
description: "Persist progress, pause for approval and resume without replaying completed tasks."
---

This example saves evidence, waits for approval and then records acceptance. It needs only the [installed package](../yaml-recipes/): no Git, sandbox or agent. Save these two complete files together.

## Store progress

The local transport declared inside the checkpoint store keeps checkpoints under `.outpost/state`; the store keeps a name because the recipe references it. Later commands must use the same configuration and run ID. The YAML format is version 3; checkpoint `version: "1"` below is a separate identity you choose for the workflow.

```yaml title="outpost.yaml"
version: 3
stores:
  checkpoint:
    type: transport
    transporter:
      type: local
      directory: ./.outpost/state
```

## Pause at an approval

`evidence` completes before the approval gate opens. The `accepted` task runs only after approval. The checkpoint keeps completed results and cumulative usage.

```yaml title="recipe.yaml"
version: 3
name: reviewed-change
workflow:
  checkpoint:
    store: { $ref: stores.checkpoint }
    runId: reviewed-change
    version: "1"
tasks:
  - key: evidence
    value: { summary: Ready for review }
  - key: review
    after: [evidence]
    gate:
      kind: approval
      prompt: Accept this evidence?
      actors: [maintainer]
  - key: accepted
    after: [review]
    value: { approved: true }
```

## Inspect, then resume

The first command uses `--json`, so it leaves the gate pending and returns a nonzero exit status with a waiting report. `status` reads saved progress. Run the last command in a terminal to see the evidence and approve with a reason; it does not rerun `evidence`.

```sh
npx outpost recipe run --file recipe.yaml --config outpost.yaml --json
npx outpost recipe status --file recipe.yaml --config outpost.yaml   --run-id reviewed-change --json
npx outpost recipe resume --file recipe.yaml --config outpost.yaml   --run-id reviewed-change --interactive
```

Leaving the gate pending is the default. For headless decisions, signed approvals or agent questions, follow [human interaction](../recipe-dialogue/).

Use `recipe run --run-id another-run` for a new execution. Use `resume` for an existing ID. Changes to recipe inputs or execution identity are refused; observation and report settings may change.

## Retain working files

For command or agent tasks, add a [workspace and sandbox](../recipe-workspaces/) to `outpost.yaml`. Checkpoints retain the original workspace and verify it before resuming; a missing workspace is not silently replaced. Each [named workspace](../recipe-workspaces/#use-several-workspaces) is retained separately; resume reopens it with the sandbox the next task selects. File snapshots are conserved before a settled checkpoint. Mounted sources must remain available.

Git workspaces retain their branch and diff baseline. File workspaces use configuration 3 with `runtime.directory`, `runtime.namespace` and optional retention settings; see [file restoration](../resuming-file-workspaces/). Borrowed workspaces cannot be restored automatically.

## Recover an interrupted run

A normal pause needs only `resume`. After a crash, stop the previous coordinator and inspect the saved state before choosing recovery.

| Saved state                                        | Required action                                           |
| -------------------------------------------------- | --------------------------------------------------------- |
| Completed tasks and a pending gate                 | Resume or submit a decision                               |
| An interrupted task                                | `resume --retry-incomplete` explicitly authorizes replay  |
| Checkpoint still owned by an abandoned coordinator | `--recover-revision <revision>` after verifying ownership |
| A retained workspace lock                          | Follow [lock recovery](../recovery/) separately           |

Ownership recovery does not authorize task replay. Heartbeat expiry authorizes neither. [CLI reference](../recipe-cli/) documents the flags.

## Add caches, artifacts or quota pauses

| Need                       | YAML integration                                        |
| -------------------------- | ------------------------------------------------------- |
| Reuse a task's JSON result | `options.cache`, a named cache store and a key callback |
| Preserve an artifact       | `artifact` with a store, contract and `data` expression |
| Wait after a quota limit   | `onQuota: { action: pause }` with cumulative budgets    |
| Track execution by ID      | A `run` observation sink backed by a transport          |

Use the [component reference](../yaml-components/) for declarations and [extensions](../recipe-extensions/) for callbacks. Cache hits do not replay effects. Continuing an agent after quota requires a captured conversation and supported restoration. The checkpoint is authoritative; observation failures do not change the outcome.

<!-- Retained section anchors for existing bookmarks. -->

<span id="configure-persistent-storage"></span>
<span id="inspect-and-resume"></span>
<span id="submit-human-decisions-and-answers"></span>
<span id="answer-directly-in-the-terminal"></span>
<span id="keep-artifacts-caches-and-quota-accounting"></span>
<span id="file-workspaces"></span>
