---
title: "Workspace"
description: "Workspace — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Workspace**. Consultez le [guide workspaces](../../sandboxes/workspaces/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Workspace } from "@elie-laloum/outpost";
```

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

## Contrats associés

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
