---
title: "WorkspaceSession"
description: "WorkspaceSession — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkspaceSession } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                    | Type                                                                | Presence | Meaning                                                                                     |
| ----------------------- | ------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `id`                    | `string`                                                            | Required | Stable identifier of this resource, independent of its materialization path.                |
| `kind`                  | `"git" \| "ephemeral" \| "directory"`                               | Required | Discriminant selecting Git, a directory source or an initially empty workspace.             |
| `directory`             | `string`                                                            | Required | Absolute local materialization or source directory; it is not a portable resource identity. |
| `runtime`               | `WorkspaceRuntime`                                                  | Required | Control directory and logical namespace, separate from the workspace files.                 |
| `close`                 | `(options?: { readonly preserve?: boolean; }) => Promise<Disposal>` | Required | Idempotent closure; preserves recoverable work and never removes a borrowed source.         |
| `[Symbol.asyncDispose]` | `() => Promise<void>`                                               | Required | Idempotent closure; preserves recoverable work and never removes a borrowed source.         |

## Signature

```ts
export interface WorkspaceSession {
  readonly id: string;
  readonly kind: "git" | "directory" | "ephemeral";
  readonly directory: string;
  readonly runtime: WorkspaceRuntime;
  close(options?: { readonly preserve?: boolean }): Promise<Disposal>;
  [Symbol.asyncDispose](): Promise<void>;
}
```

## Related contracts

- [Disposal](../disposal/)
- [WorkspaceRuntime](../workspaceruntime/)
