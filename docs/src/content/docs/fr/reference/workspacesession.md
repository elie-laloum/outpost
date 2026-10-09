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

## Paramètres et propriétés

| Nom                     | Type                                                                | Présence | Rôle                                                                                                 |
| ----------------------- | ------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `id`                    | `string`                                                            | Requis   | Identifiant stable de cette ressource, indépendant du chemin de matérialisation.                     |
| `kind`                  | `"git" \| "ephemeral" \| "directory"`                               | Requis   | Discriminant sélectionnant Git, une source dossier ou un workspace initialement vide.                |
| `directory`             | `string`                                                            | Requis   | Répertoire local absolu de matérialisation ou de source ; ce chemin n’est pas une identité portable. |
| `runtime`               | `WorkspaceRuntime`                                                  | Requis   | Répertoire de contrôle et namespace logique, séparés des fichiers du workspace.                      |
| `close`                 | `(options?: { readonly preserve?: boolean; }) => Promise<Disposal>` | Requis   | Fermeture idempotente ; conserve le travail récupérable et ne supprime jamais une source empruntée.  |
| `[Symbol.asyncDispose]` | `() => Promise<void>`                                               | Requis   | Fermeture idempotente ; conserve le travail récupérable et ne supprime jamais une source empruntée.  |

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

## Contrats associés

- [Disposal](../disposal/)
- [WorkspaceRuntime](../workspaceruntime/)
