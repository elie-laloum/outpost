---
title: "ConflictContext"
description: "ConflictContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ConflictContext } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name              | Type                          | Presence | Meaning                                                                                                                                                                                                                              |
| ----------------- | ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `workspace`       | `Workspace`                   | Required | Separate named workspace owned by the integration engine and starting at candidateCommit. The strategy may allocate a sandbox on it, must close that sandbox before returning, and must not integrate or close the workspace itself. |
| `hostCommit`      | `string`                      | Required | Exact host commit to merge into the resolution workspace; final integration is refused if the host branch or commit changes.                                                                                                         |
| `candidateCommit` | `string`                      | Required | Exact source branch commit captured by preflight and used to open the resolution workspace. Final integration requires it to remain unchanged and be an ancestor of the resolution.                                                  |
| `conflicts`       | `readonly string[]`           | Required | Repository-relative paths reported as conflicted by Git merge-tree; actual unmerged entries are prepared inside the chosen sandbox.                                                                                                  |
| `signal`          | `AbortSignal`                 | Required | Combined integration caller and total-deadline signal. The strategy must pass it to its sandbox, agent and verification operations.                                                                                                  |
| `observation`     | `ObservationHub \| undefined` | Optional | Workspace observation hub inherited by the resolution; propagate it explicitly to sandbox operations and agent dispatch.                                                                                                             |

## Signature

```ts
export interface ConflictContext {
  readonly workspace: Workspace;
  readonly hostCommit: string;
  readonly candidateCommit: string;
  readonly conflicts: readonly string[];
  readonly signal: AbortSignal;
  readonly observation?: ObservationHub;
}
```

## Related contracts

- [ObservationHub](../observationhub/)
- [Workspace](../workspace/)
