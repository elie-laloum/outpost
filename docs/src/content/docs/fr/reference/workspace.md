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

## Paramètres et propriétés

| Nom                     | Type                                                                                                                                                                                                        | Présence | Rôle                                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `dispatch`              | `<T = undefined>(options: Omit<SandboxOptions, Exclude<keyof WorkspaceOptions, "hooks" \| "label"> \| "workspace"> & DispatchOptions<T> & { readonly agent: AgentAdapter; }) => Promise<DispatchResult<T>>` | Requis   | Exécute un agent dans une sandbox nouvellement acquise en conservant ce workspace appartenant à l’appelant.         |
| `sandbox`               | `(options?: Omit<SandboxOptions, Exclude<keyof WorkspaceOptions, "hooks" \| "label"> \| "workspace">) => Promise<Sandbox>`                                                                                  | Requis   | Alloue une sandbox réutilisable liée à ce workspace.                                                                |
| `attach`                | `(options: Omit<SandboxOptions, Exclude<keyof WorkspaceOptions, "hooks" \| "label"> \| "workspace"> & AttachOptions & { readonly agent: AgentAdapter; }) => Promise<AttachResult>`                          | Requis   | Ouvre le terminal interactif d’un agent dans une sandbox nouvellement acquise pour ce workspace.                    |
| `close`                 | `(options?: { readonly preserve?: boolean; }) => Promise<Disposal>`                                                                                                                                         | Requis   | Libère la possession du workspace ; préserve le travail sale ou détaché et respecte une demande preserve explicite. |
| `integrate`             | `() => Promise<void>`                                                                                                                                                                                       | Requis   | Intègre explicitement la branche de travail gérée dans sa branche de base sous la possession Git du workspace.      |
| `[Symbol.asyncDispose]` | `() => Promise<void>`                                                                                                                                                                                       | Requis   | Ferme cette ressource via le mécanisme de libération asynchrone JavaScript.                                         |
| `repository`            | `string`                                                                                                                                                                                                    | Requis   | Checkout Git hôte ciblé.                                                                                            |
| `directory`             | `string`                                                                                                                                                                                                    | Requis   | Dossier hôte du workspace utilisé pour cette exécution.                                                             |
| `branch`                | `string`                                                                                                                                                                                                    | Requis   | Nom de la branche de travail utilisée ou observée pendant l’exécution.                                              |
| `baseBranch`            | `string`                                                                                                                                                                                                    | Requis   | Branche hôte choisie comme cible d’intégration à l’ouverture du workspace.                                          |
| `baseline`              | `string`                                                                                                                                                                                                    | Requis   | Commit Git utilisé comme état initial pour mesurer le nouveau travail.                                              |
| `gitDirectories`        | `readonly string[]`                                                                                                                                                                                         | Requis   | Dossiers hôtes de métadonnées Git nécessaires à l’accès au dépôt du workspace.                                      |
| `policy`                | `BranchPolicy`                                                                                                                                                                                              | Requis   | Politique de branche choisie à l’ouverture du workspace.                                                            |

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
