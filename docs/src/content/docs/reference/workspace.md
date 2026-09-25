---
title: "Workspace"
description: "Workspace — Outpost API"
sidebar:
  order: 10
---

Public contract for **Workspace**. See the [workspaces guide](../../guide/environment/workspaces/) for behavior, defaults and examples.

## Import

```ts
import type { Workspace } from "@elie-laloum/outpost";
```

## Purpose and behavior

Own a repository checkout, branch and lock independently of sandbox lifetime.

Repository defaults to the current working directory. Named branches retain commits; dirty or detached worktrees remain recoverable. Close the sandbox before its caller-owned workspace.

[Complete example and detailed rules](../../guide/environment/workspaces/).

## Parameters and properties

| Name             | Type                                                                                                                                                                                                        | Presence | Meaning                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `dispatch`       | `<T = undefined>(options: Omit<SandboxOptions, Exclude<keyof WorkspaceOptions, "hooks" \| "label"> \| "workspace"> & DispatchOptions<T> & { readonly agent: AgentAdapter; }) => Promise<DispatchResult<T>>` | Required | See the linked contract and this family's rules for its interpretation.        |
| `sandbox`        | `(options?: Omit<SandboxOptions, Exclude<keyof WorkspaceOptions, "hooks" \| "label"> \| "workspace">) => Promise<Sandbox>`                                                                                  | Required | See the linked contract and this family's rules for its interpretation.        |
| `attach`         | `(options: Omit<SandboxOptions, Exclude<keyof WorkspaceOptions, "hooks" \| "label"> \| "workspace"> & AttachOptions & { readonly agent: AgentAdapter; }) => Promise<AttachResult>`                          | Required | See the linked contract and this family's rules for its interpretation.        |
| `close`          | `(options?: { readonly preserve?: boolean; }) => Promise<Disposal>`                                                                                                                                         | Required | See the linked contract and this family's rules for its interpretation.        |
| `integrate`      | `() => Promise<void>`                                                                                                                                                                                       | Required | See the linked contract and this family's rules for its interpretation.        |
| `repository`     | `string`                                                                                                                                                                                                    | Required | Target host Git checkout.                                                      |
| `directory`      | `string`                                                                                                                                                                                                    | Required | Filesystem directory used by the owning operation; see path rules.             |
| `branch`         | `string`                                                                                                                                                                                                    | Required | Git workspace policy or resulting branch identity, according to this contract. |
| `baseBranch`     | `string`                                                                                                                                                                                                    | Required | See the linked contract and this family's rules for its interpretation.        |
| `baseline`       | `string`                                                                                                                                                                                                    | Required | See the linked contract and this family's rules for its interpretation.        |
| `gitDirectories` | `readonly string[]`                                                                                                                                                                                         | Required | See the linked contract and this family's rules for its interpretation.        |
| `policy`         | `BranchPolicy`                                                                                                                                                                                              | Required | See the linked contract and this family's rules for its interpretation.        |

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
