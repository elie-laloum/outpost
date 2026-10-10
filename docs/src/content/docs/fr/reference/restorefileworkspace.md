---
title: "restoreFileWorkspace"
description: "restoreFileWorkspace — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { restoreFileWorkspace } from "@elie-laloum/outpost";
```

## Rôle et comportement

Restaure une ressource de fichiers settled inspectée localement, ou un snapshot portable vérifié avec un Transport explicite. Le travail local perdu ou remplacé est refusé.

[Exemple complet et règles détaillées](../../guide/resuming-file-workspaces/).

## Paramètres et propriétés

| Nom                 | Type                                                                                                                                                                                                         | Présence  | Rôle                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `record`            | `FileWorkspaceRecord`                                                                                                                                                                                        | Requis    | Description versionnée du workspace conservant sa propriété, sa génération settled et ses références de récupération.                   |
| `options`           | `RestoreFileWorkspaceOptions \| undefined`                                                                                                                                                                   | Optionnel | Choisit la restauration locale ou portable et les autorisations explicites de récupération de propriété.                                |
| `options.runtime`   | `WorkspaceRuntimeOptions \| undefined`                                                                                                                                                                       | Optionnel | Répertoire de contrôle et namespace logique, séparés des fichiers du workspace.                                                         |
| `options.retention` | `WorkspaceRetention \| undefined`                                                                                                                                                                            | Optionnel | run nettoie le travail possédé réussi, local le conserve, portable exige en plus un Transport et un namespace explicites.               |
| `options.portable`  | `boolean \| undefined`                                                                                                                                                                                       | Optionnel | Restaure un snapshot vérifié dans une nouvelle matérialisation possédée ; les sources montées doivent rester accessibles et inchangées. |
| `options.recover`   | `{ readonly processesStopped: true; readonly expectedRevision?: string; readonly allocationReleased?: true; readonly adoptInterruptedFiles?: boolean; readonly adoptMountedSource?: boolean; } \| undefined` | Optionnel | Autorisation explicite de récupération après arrêt des processus ; le replay interrompu reste une décision distincte du workflow.       |

## Retour

`Promise<FileWorkspace>`

## Signature

```ts
export declare function restoreFileWorkspace(
  record: FileWorkspaceRecord,
  options?: RestoreFileWorkspaceOptions,
): Promise<FileWorkspace>;
```

## Contrats associés

- [FileWorkspace](../fileworkspace/)
- [FileWorkspaceRecord](../fileworkspacerecord/)
- [RestoreFileWorkspaceOptions](../restorefileworkspaceoptions/)
