---
title: "FileWorkspace"
description: "FileWorkspace — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileWorkspace } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                    | Type                                                                                                                                        | Presence | Meaning                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `kind`                  | `"ephemeral" \| "directory"`                                                                                                                | Required | Discriminant selecting Git, a directory source or an initially empty workspace.                                     |
| `source`                | `FileWorkspaceSource`                                                                                                                       | Required | Declared source for an owned resource; mutually exclusive with borrowing an open workspace.                         |
| `checkpoint`            | `() => Promise<FileWorkspaceRecord>`                                                                                                        | Required | Synchronizes and verifies a settled generation before returning its durable description; refuses active operations. |
| `sandbox`               | `(options: FileSandboxSettings) => Promise<FileSandbox>`                                                                                    | Required | Sandbox bound to this workspace; closing it leaves a borrowed workspace open.                                       |
| `dispatch`              | `<T = undefined>(options: FileSandboxSettings & DispatchOptions<T> & { readonly agent: DispatchAgent; }) => Promise<FileDispatchResult<T>>` | Required | Runs an agent against the current files, preserving the workspace across repairs and steering passes.               |
| `id`                    | `string`                                                                                                                                    | Required | Stable identifier of this resource, independent of its materialization path.                                        |
| `directory`             | `string`                                                                                                                                    | Required | Absolute local materialization or source directory; it is not a portable resource identity.                         |
| `runtime`               | `WorkspaceRuntime`                                                                                                                          | Required | Control directory and logical namespace, separate from the workspace files.                                         |
| `close`                 | `(options?: { readonly preserve?: boolean; }) => Promise<Disposal>`                                                                         | Required | Idempotent closure; preserves recoverable work and never removes a borrowed source.                                 |
| `[Symbol.asyncDispose]` | `() => Promise<void>`                                                                                                                       | Required | Idempotent closure; preserves recoverable work and never removes a borrowed source.                                 |

## Signature

```ts
export interface FileWorkspace extends WorkspaceSession {
  readonly kind: "directory" | "ephemeral";
  readonly source: FileWorkspaceSource;
  checkpoint(): Promise<FileWorkspaceRecord>;
  sandbox(options: FileSandboxSettings): Promise<FileSandbox>;
  dispatch<T = undefined>(
    options: FileSandboxSettings &
      DispatchOptions<T> & {
        readonly agent: DispatchAgent;
      },
  ): Promise<FileDispatchResult<T>>;
}
```

## Related contracts

- [FileWorkspaceRecord](../fileworkspacerecord/)
- [FileWorkspaceSource](../fileworkspacesource/)
- [WorkspaceSession](../workspacesession/)
