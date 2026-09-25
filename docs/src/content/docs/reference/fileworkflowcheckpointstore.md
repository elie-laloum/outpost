---
title: "fileWorkflowCheckpointStore"
description: "fileWorkflowCheckpointStore — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { fileWorkflowCheckpointStore } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a checkpoint store with exactly one directory or transporter. The directory mode keeps existing JSON files, atomic replacement and local process locks. Transport mode delegates to workflowCheckpointStore and uses conditional envelopes with explicit ownership recovery. Changing modes does not migrate saved runs.

[Complete example and detailed rules](../../guide/advanced/checkpoints/).

## Parameters and properties

| Name                  | Type                            | Presence | Meaning                                                                                                                              |
| --------------------- | ------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `options`             | `FileWorkflowCheckpointOptions` | Required | Exactly one legacy directory or object transporter. Each mode preserves its own layout and ownership mechanism.                      |
| `options.directory`   | `string \| undefined`           | Optional | Legacy checkpoint directory and local process locks, mutually exclusive with transporter; existing JSON layout is preserved.         |
| `options.transporter` | `Transport \| undefined`        | Optional | Alternative to directory; uses the transport checkpoint envelope and explicit ownership recovery. Supply exactly one storage choice. |

## Returns

`WorkflowCheckpointStore`

## Signature

```ts
export declare function fileWorkflowCheckpointStore(
  options: FileWorkflowCheckpointOptions,
): WorkflowCheckpointStore;
```

## Related contracts

- [FileWorkflowCheckpointOptions](../fileworkflowcheckpointoptions/)
- [WorkflowCheckpointStore](../workflowcheckpointstore/)
