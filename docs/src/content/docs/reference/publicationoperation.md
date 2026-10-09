---
title: "PublicationOperation"
description: "PublicationOperation — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { PublicationOperation } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                | Type                                                                                                 | Presence | Meaning                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `path`              | `string`                                                                                             | Required | Validated relative path preserving its prefix; traversal and control paths are refused.   |
| `previous`          | `WorkspaceFileEntry \| undefined`                                                                    | Optional | Expected entry before publication, conserved in quarantine for conditional rollback.      |
| `incoming`          | `WorkspaceFileEntry \| undefined`                                                                    | Optional | Validated incoming entry; absence represents an explicitly selected deletion.             |
| `rollbackDisplaced` | `string \| undefined`                                                                                | Optional | Exclusive backup-relative path retaining the installed entry displaced during rollback.   |
| `phase`             | `"pending" \| "quarantine-intent" \| "quarantined" \| "install-intent" \| "installed" \| "restored"` | Required | Durable intent/result phase allowing finish or rollback without rerunning workflow tasks. |

## Signature

```ts
export interface PublicationOperation {
  readonly path: string;
  readonly previous?: WorkspaceFileEntry;
  readonly incoming?: WorkspaceFileEntry;
  rollbackDisplaced?: string;
  phase:
    | "pending"
    | "quarantine-intent"
    | "quarantined"
    | "install-intent"
    | "installed"
    | "restored";
}
```

## Related contracts

- [WorkspaceFileEntry](../workspacefileentry/)
