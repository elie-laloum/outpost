---
title: "Workspace"
description: "Workspace — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Workspace**. Consultez le [guide workspaces](../../guide/environment/workspaces/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Workspace } from "@elie-laloum/outpost";
```

## Rôle et comportement

Posséder un checkout, une branche et un verrou indépendamment de la durée de vie de la sandbox.

Le dépôt vaut par défaut le dossier courant. Les branches nommées conservent les commits ; les worktrees sales ou détachés restent récupérables. Fermez la sandbox avant le workspace appartenant à l’appelant.

[Exemple complet et règles détaillées](../../guide/environment/workspaces/).

## Paramètres et propriétés

| Nom              | Type                                                                                                                                                                                                        | Présence | Rôle                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `dispatch`       | `<T = undefined>(options: Omit<SandboxOptions, Exclude<keyof WorkspaceOptions, "hooks" \| "label"> \| "workspace"> & DispatchOptions<T> & { readonly agent: AgentAdapter; }) => Promise<DispatchResult<T>>` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `sandbox`        | `(options?: Omit<SandboxOptions, Exclude<keyof WorkspaceOptions, "hooks" \| "label"> \| "workspace">) => Promise<Sandbox>`                                                                                  | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `attach`         | `(options: Omit<SandboxOptions, Exclude<keyof WorkspaceOptions, "hooks" \| "label"> \| "workspace"> & AttachOptions & { readonly agent: AgentAdapter; }) => Promise<AttachResult>`                          | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `close`          | `(options?: { readonly preserve?: boolean; }) => Promise<Disposal>`                                                                                                                                         | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `integrate`      | `() => Promise<void>`                                                                                                                                                                                       | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `repository`     | `string`                                                                                                                                                                                                    | Requis   | Checkout Git hôte ciblé.                                                         |
| `directory`      | `string`                                                                                                                                                                                                    | Requis   | Dossier utilisé par l’opération ; voir les règles de résolution.                 |
| `branch`         | `string`                                                                                                                                                                                                    | Requis   | Politique de workspace Git ou identité de branche résultante selon ce contrat.   |
| `baseBranch`     | `string`                                                                                                                                                                                                    | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `baseline`       | `string`                                                                                                                                                                                                    | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `gitDirectories` | `readonly string[]`                                                                                                                                                                                         | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `policy`         | `BranchPolicy`                                                                                                                                                                                              | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
