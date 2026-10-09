---
title: "RestoreFileWorkspaceOptions"
description: "RestoreFileWorkspaceOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RestoreFileWorkspaceOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                                                                                                                                                                                         | Présence  | Rôle                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `runtime`   | `WorkspaceRuntimeOptions \| undefined`                                                                                                                                                                       | Optionnel | Répertoire de contrôle et namespace logique, séparés des fichiers du workspace.                                                         |
| `retention` | `WorkspaceRetention \| undefined`                                                                                                                                                                            | Optionnel | run nettoie le travail possédé réussi, local le conserve, portable exige en plus un Transport et un namespace explicites.               |
| `portable`  | `boolean \| undefined`                                                                                                                                                                                       | Optionnel | Restaure un snapshot vérifié dans une nouvelle matérialisation possédée ; les sources montées doivent rester accessibles et inchangées. |
| `recover`   | `{ readonly processesStopped: true; readonly expectedRevision?: string; readonly allocationReleased?: true; readonly adoptInterruptedFiles?: boolean; readonly adoptMountedSource?: boolean; } \| undefined` | Optionnel | Autorisation explicite de récupération après arrêt des processus ; le replay interrompu reste une décision distincte du workflow.       |

## Signature

```ts
export interface RestoreFileWorkspaceOptions {
  readonly runtime?: WorkspaceRuntimeOptions;
  readonly retention?: WorkspaceRetention;
  readonly portable?: boolean;
  readonly recover?: {
    readonly processesStopped: true;
    readonly expectedRevision?: string;
    readonly allocationReleased?: true;
    readonly adoptInterruptedFiles?: boolean;
    readonly adoptMountedSource?: boolean;
  };
}
```

## Contrats associés

- [WorkspaceRetention](../workspaceretention/)
- [WorkspaceRuntimeOptions](../workspaceruntimeoptions/)
