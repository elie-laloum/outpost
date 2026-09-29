---
title: "Workflow checkpoints — Overview"
description: "The durable state of a workflow run: task records, lossless JSON outputs and cumulative usage, owned by one runner at a time."
sidebar:
  label: Overview
  order: 0
---

## What a checkpoint stores

`start({ checkpoint })` saves the run under `runId` when a task starts, before each attempt, on each usage report and when a task settles. A later `start()` with the same `runId` restores it.

| Saved                                                       | Field         | On restart                                                                                                                        |
| ----------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Status, attempts, errors, gate, input, quota and loop state | `records`     | `done` tasks stay done; gates, questions and quota pauses continue; failed or interrupted tasks need `resume: "retry-incomplete"` |
| Output of each `done` task                                  | `values`      | Restored for `context.value()`; the task never runs again                                                                         |
| Attempts and tokens                                         | `usage`       | Keep adding up, so a `budget` spans every resume                                                                                  |
| Execution ID                                                | `executionId` | Kept, so `context.idempotencyKey` stays the same for each task                                                                    |
| Hash of the workflow name, `version` and task graph         | `identity`    | Must match, otherwise `start()` rejects before any task runs                                                                      |

Outputs must be lossless JSON or `undefined`; any other value fails its task. A checkpoint holds at most 16 MiB and does not save sandboxes, files, native conversations or task code.

## Ownership and recovery

A run owns its checkpoint from `start()` until it returns. Each write is conditional on the last revision, so a runner that lost ownership fails with `TransportConflict`.

| Situation                                       | Result                                            | What to do                                                                                                                                          |
| ----------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Another `start()` holds the `runId`             | `start()` rejects: already in use                 | Wait for it to return, or use another `runId`                                                                                                       |
| The runner process died                         | Ownership stays recorded; every `start()` rejects | Stop the old runner, read the checkpoint object’s revision, pass it to `recoverWorkflowCheckpoint()`, then resume with `resume: "retry-incomplete"` |
| A task failed, was cancelled or was interrupted | `start()` rejects without `resume`                | Pass `resume: "retry-incomplete"`; those tasks run again, with their side effects                                                                   |
| The identity changed (new `version` or graph)   | `start()` rejects: incompatible checkpoint        | Start under a new `runId`                                                                                                                           |
| A checkpoint write fails or exceeds 16 MiB      | Active tasks are cancelled; `start()` rejects     | Fix the store or move large payloads to artifacts, then resume with `resume: "retry-incomplete"`                                                    |

:::caution
Stop the old runner before recovery. Revision fencing rejects its later checkpoint writes, not the side effects it is still making.
:::

## Entry points

Guide: [Durable runs](../../../guide/durable-runs/) · [Job queues and workers](../../../guide/job-queues/) · [Where data lives](../../../guide/storage/)

- [createWorkflowCheckpointStore](../../createworkflowcheckpointstore/)
- [recoverWorkflowCheckpoint](../../recoverworkflowcheckpoint/)
- [WorkflowCheckpointOptions](../../workflowcheckpointoptions/)
- [WorkflowCheckpoint](../../workflowcheckpoint/)
- [WorkflowCheckpointValue](../../workflowcheckpointvalue/)
- [WorkflowJson](../../workflowjson/)
- [WorkflowCheckpointStore](../../workflowcheckpointstore/)
- [WorkflowCheckpointLease](../../workflowcheckpointlease/)
