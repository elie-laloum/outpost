---
title: "WorkspacePathLock"
description: "WorkspacePathLock — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspacePathLock } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                  | Type                                        | Presence | Meaning                                                                                                                                                                                                            |
| --------------------- | ------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`                  | `string`                                    | Required | Stable identifier of this resource, independent of its materialization path.                                                                                                                                       |
| `directory`           | `string`                                    | Required | Absolute local materialization or source directory; it is not a portable resource identity.                                                                                                                        |
| `writable`            | `boolean`                                   | Required | Writer intent; overlapping paths are refused when either owner can write.                                                                                                                                          |
| `identity`            | `WorkspacePathGate \| undefined`            | Optional | Device and inode identity used to detect replacement and known filesystem aliases.                                                                                                                                 |
| `ancestors`           | `readonly WorkspacePathGate[] \| undefined` | Optional | Filesystem identities of existing ancestors used to detect overlapping aliases.                                                                                                                                    |
| `excludedDirectories` | `readonly string[] \| undefined`            | Optional | Canonical control subdirectories excluded from a copy-source read lock. Owned materializations can coexist there while overlapping data writers and full source mounts remain fenced. Older locks omit this field. |

## Signature

```ts
export interface WorkspacePathLock {
  readonly id: string;
  readonly directory: string;
  readonly writable: boolean;
  readonly identity?: WorkspacePathGate;
  readonly ancestors?: readonly WorkspacePathGate[];
  readonly excludedDirectories?: readonly string[];
}
```

## Related contracts

- [WorkspacePathGate](../support-workspacepathgate/)
