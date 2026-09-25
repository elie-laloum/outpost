---
title: "Workflow checkpoints — Overview"
description: "A checkpoint stores the durable state of a workflow execution: task outcomes, JSON values and cumulative usage."
sidebar:
  label: Overview
  order: 0
---

A checkpoint stores the durable state of a workflow execution: task outcomes, JSON values and cumulative usage. It lets a later process reopen a saved run instead of relying on in-memory handles that disappear when the original process exits.

## How it works

A run identity and graph version connect persisted state to the workflow definition. `fileWorkflowCheckpointStore` provides filesystem persistence; the store and lease contracts define ownership while accessing that state. Completed values can be reused according to the checkpoint and replay rules.

## Boundaries and responsibilities

Stored outputs must be lossless JSON. Replaying work with external effects requires explicit authorization; persistence cannot guarantee exactly-once effects. A checkpoint does not snapshot every sandbox, filesystem or native agent conversation.

## Entry points

- [fileWorkflowCheckpointStore](../../fileworkflowcheckpointstore/)
- [WorkflowCheckpointOptions](../../workflowcheckpointoptions/)
- [WorkflowCheckpointStore](../../workflowcheckpointstore/)
- [WorkflowCheckpoint](../../workflowcheckpoint/)
- [WorkflowJson](../../workflowjson/)

[Learn with the practical guide](../../../guide/advanced/checkpoints/).
