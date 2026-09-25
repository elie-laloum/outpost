---
title: "Workspace"
description: "Workspace — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Workspace } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                    | Type                                                                                                                                                                                                        | Presence | Meaning                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `dispatch`              | `<T = undefined>(options: Omit<SandboxOptions, Exclude<keyof WorkspaceOptions, "hooks" \| "label"> \| "workspace"> & DispatchOptions<T> & { readonly agent: AgentAdapter; }) => Promise<DispatchResult<T>>` | Required | Run an agent with a newly acquired sandbox while retaining this caller-owned workspace.                |
| `sandbox`               | `(options?: Omit<SandboxOptions, Exclude<keyof WorkspaceOptions, "hooks" \| "label"> \| "workspace">) => Promise<Sandbox>`                                                                                  | Required | Allocate a reusable sandbox bound to this workspace.                                                   |
| `attach`                | `(options: Omit<SandboxOptions, Exclude<keyof WorkspaceOptions, "hooks" \| "label"> \| "workspace"> & AttachOptions & { readonly agent: AgentAdapter; }) => Promise<AttachResult>`                          | Required | Open an interactive agent terminal in a newly acquired sandbox for this workspace.                     |
| `close`                 | `(options?: { readonly preserve?: boolean; }) => Promise<Disposal>`                                                                                                                                         | Required | Release workspace ownership; preserve dirty or detached work and honor an explicit preserve request.   |
| `integrate`             | `() => Promise<void>`                                                                                                                                                                                       | Required | Explicitly integrate the managed work branch into its base branch under the workspace’s Git ownership. |
| `[Symbol.asyncDispose]` | `() => Promise<void>`                                                                                                                                                                                       | Required | Close this resource through JavaScript asynchronous resource disposal.                                 |
| `repository`            | `string`                                                                                                                                                                                                    | Required | Target host Git checkout.                                                                              |
| `directory`             | `string`                                                                                                                                                                                                    | Required | Host workspace directory used for this execution.                                                      |
| `branch`                | `string`                                                                                                                                                                                                    | Required | Name of the work branch used or observed during execution.                                             |
| `baseBranch`            | `string`                                                                                                                                                                                                    | Required | Host branch selected as the integration target when the workspace opened.                              |
| `baseline`              | `string`                                                                                                                                                                                                    | Required | Git commit used as the initial snapshot for measuring new work.                                        |
| `gitDirectories`        | `readonly string[]`                                                                                                                                                                                         | Required | Host Git metadata directories required to access the workspace repository.                             |
| `policy`                | `BranchPolicy`                                                                                                                                                                                              | Required | Branch policy chosen when the workspace was opened.                                                    |

## Signature

```ts
export interface Workspace extends WorkspaceRecord {
  dispatch<T = undefined>(
    options: Omit<
      SandboxOptions,
      Exclude<keyof WorkspaceOptions, "hooks" | "label"> | "workspace"
    > &
      DispatchOptions<T> & {
        readonly agent: AgentAdapter;
      },
  ): Promise<DispatchResult<T>>;
  sandbox(
    options?: Omit<
      SandboxOptions,
      Exclude<keyof WorkspaceOptions, "hooks" | "label"> | "workspace"
    >,
  ): Promise<Sandbox>;
  attach(
    options: Omit<
      SandboxOptions,
      Exclude<keyof WorkspaceOptions, "hooks" | "label"> | "workspace"
    > &
      AttachOptions & {
        readonly agent: AgentAdapter;
      },
  ): Promise<AttachResult>;
  close(options?: { readonly preserve?: boolean }): Promise<Disposal>;
  integrate(): Promise<void>;
  [Symbol.asyncDispose](): Promise<void>;
}
```

## Related contracts

- [AgentAdapter](../agentadapter/)
- [AttachOptions](../attachoptions/)
- [AttachResult](../attachresult/)
- [DispatchOptions](../dispatchoptions/)
- [DispatchResult](../dispatchresult/)
- [Disposal](../disposal/)
- [Sandbox](../sandbox/)
- [SandboxOptions](../sandboxoptions/)
- [WorkspaceOptions](../workspaceoptions/)
- [WorkspaceRecord](../workspacerecord/)
