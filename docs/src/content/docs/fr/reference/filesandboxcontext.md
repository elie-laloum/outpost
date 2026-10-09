---
title: "FileSandboxContext"
description: "FileSandboxContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileSandboxContext } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                | Type                                                   | Présence  | Rôle                                                                                                                                       |
| ------------------ | ------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `workspace`        | `FileWorkspaceRecord`                                  | Requis    | Workspace ouvert emprunté pour cette opération ; son caller reste responsable de sa fermeture.                                             |
| `runtime`          | `WorkspaceRuntime`                                     | Requis    | Répertoire de contrôle et namespace logique, séparés des fichiers du workspace.                                                            |
| `variables`        | `Readonly<Record<string, string>>`                     | Requis    | Seules les variables d’environnement explicitement déclarées atteignent la sandbox ; aucun chargement implicite de .env.                   |
| `signal`           | `AbortSignal \| undefined`                             | Optionnel | Signal d’annulation transmis à l’opération et à son groupe de processus ; les sandboxes réutilisables restent utilisables.                 |
| `registerRecovery` | `((resourceId: string) => Promise<void>) \| undefined` | Optionnel | Enregistre l’identité de ressource du provider avant la fin de l’acquisition pour conserver l’inspectabilité d’une allocation interrompue. |

## Signature

```ts
export interface FileSandboxContext {
  readonly workspace: FileWorkspaceRecord;
  readonly runtime: WorkspaceRuntime;
  readonly variables: Variables;
  readonly signal?: AbortSignal;
  readonly registerRecovery?: (resourceId: string) => Promise<void>;
}
```

## Contrats associés

- [FileWorkspaceRecord](../fileworkspacerecord/)
- [Variables](../variables/)
- [WorkspaceRuntime](../workspaceruntime/)
