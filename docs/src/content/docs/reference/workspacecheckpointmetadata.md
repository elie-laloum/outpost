---
title: "WorkspaceCheckpointMetadata"
description: "WorkspaceCheckpointMetadata — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspaceCheckpointMetadata } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                                     | Presence | Meaning                                                                                               |
| ----------- | ---------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `format`    | `1`                                      | Required | Version of the persisted envelope; unsupported versions are refused.                                  |
| `resources` | `Readonly<Record<string, WorkflowJson>>` | Required | Resource descriptions keyed by logical task identity; accounting writes do not snapshot active files. |

## Signature

```ts
export interface WorkspaceCheckpointMetadata {
  readonly format: 1;
  readonly resources: Readonly<Record<string, WorkflowJson>>;
}
```

## Related contracts

- [WorkflowJson](../workflowjson/)
