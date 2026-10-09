---
title: "PublicationJournal"
description: "PublicationJournal — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { PublicationJournal } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                                                | Presence | Meaning                                                                                                  |
| ------------- | ------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `format`      | `1`                                                                 | Required | Version of the persisted envelope; unsupported versions are refused.                                     |
| `id`          | `string`                                                            | Required | Stable identifier of this resource, independent of its materialization path.                             |
| `workspaceId` | `string`                                                            | Required | Stable workspace identity to which this publication journal belongs.                                     |
| `options`     | `WorkspaceOutputOptions`                                            | Required | Options selecting source, execution capabilities or inspected recovery preconditions for this operation. |
| `staging`     | `string`                                                            | Required | Exclusive validated incoming directory on the destination filesystem, retained for explicit recovery.    |
| `backup`      | `string`                                                            | Required | Exclusive quarantine preserving displaced originals and rollback evidence.                               |
| `operations`  | `PublicationOperation[]`                                            | Required | Ordered creation, replacement and deletion plan, with intent and result journal phases.                  |
| `directories` | `PublicationDirectory[] \| undefined`                               | Optional | Owned directory creation plan with recorded filesystem identities and conditional cleanup.               |
| `outputs`     | `readonly WorkspaceFileEntry[] \| undefined`                        | Optional | Declared protected publications performed only after successful work and sandbox closure.                |
| `lock`        | `{ readonly id: string; readonly directory: string; } \| undefined` | Optional | Exact destination lock identity; interrupted ownership requires explicit stopped-process recovery.       |
| `state`       | `"complete" \| "applying" \| "rolled-back" \| "recovery-required"`  | Required | Persisted lifecycle state; uncertain or recovery-required resources are never silently reconstructed.    |

## Signature

```ts
export interface PublicationJournal {
  readonly format: 1;
  readonly id: string;
  readonly workspaceId: string;
  readonly options: WorkspaceOutputOptions;
  readonly staging: string;
  readonly backup: string;
  readonly operations: PublicationOperation[];
  readonly directories?: PublicationDirectory[];
  readonly outputs?: readonly WorkspaceFileEntry[];
  lock?: {
    readonly id: string;
    readonly directory: string;
  };
  state: WorkspacePublication["state"] | "applying";
}
```

## Related contracts

- [PublicationDirectory](../publicationdirectory/)
- [PublicationOperation](../publicationoperation/)
- [WorkspaceFileEntry](../workspacefileentry/)
- [WorkspaceOutputOptions](../workspaceoutputoptions/)
- [WorkspacePublication](../workspacepublication/)
