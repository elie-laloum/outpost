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

## Paramètres et propriétés

| Nom                     | Type                                                                                                                                        | Présence | Rôle                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `kind`                  | `"ephemeral" \| "directory"`                                                                                                                | Requis   | Discriminant sélectionnant Git, une source dossier ou un workspace initialement vide.                                   |
| `source`                | `FileWorkspaceSource`                                                                                                                       | Requis   | Source déclarée pour une ressource possédée ; exclusive de l’emprunt d’un workspace ouvert.                             |
| `checkpoint`            | `() => Promise<FileWorkspaceRecord>`                                                                                                        | Requis   | Synchronise et vérifie une génération settled avant de renvoyer sa description durable ; refuse les opérations actives. |
| `sandbox`               | `(options: FileSandboxSettings) => Promise<FileSandbox>`                                                                                    | Requis   | Sandbox liée à ce workspace ; sa fermeture laisse ouvert un workspace emprunté.                                         |
| `dispatch`              | `<T = undefined>(options: FileSandboxSettings & DispatchOptions<T> & { readonly agent: DispatchAgent; }) => Promise<FileDispatchResult<T>>` | Requis   | Exécute un agent sur les fichiers actuels, en conservant le workspace entre réparations et passes de steering.          |
| `id`                    | `string`                                                                                                                                    | Requis   | Identifiant stable de cette ressource, indépendant du chemin de matérialisation.                                        |
| `directory`             | `string`                                                                                                                                    | Requis   | Répertoire local absolu de matérialisation ou de source ; ce chemin n’est pas une identité portable.                    |
| `runtime`               | `WorkspaceRuntime`                                                                                                                          | Requis   | Répertoire de contrôle et namespace logique, séparés des fichiers du workspace.                                         |
| `close`                 | `(options?: { readonly preserve?: boolean; }) => Promise<Disposal>`                                                                         | Requis   | Fermeture idempotente ; conserve le travail récupérable et ne supprime jamais une source empruntée.                     |
| `[Symbol.asyncDispose]` | `() => Promise<void>`                                                                                                                       | Requis   | Fermeture idempotente ; conserve le travail récupérable et ne supprime jamais une source empruntée.                     |

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

## Contrats associés

- [FileWorkspaceRecord](../fileworkspacerecord/)
- [FileWorkspaceSource](../fileworkspacesource/)
- [WorkspaceSession](../workspacesession/)
