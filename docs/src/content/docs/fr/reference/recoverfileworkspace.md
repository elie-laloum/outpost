---
title: "recoverFileWorkspace"
description: "recoverFileWorkspace — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { recoverFileWorkspace } from "@elie-laloum/outpost";
```

## Rôle et comportement

Revendique un workspace de fichiers abandonné inspecté après autorisation explicite d’arrêt des processus et vérification de fermeture de l’allocation. L’adoption de fichiers ou de source montée est distincte et explicite.

[Exemple complet et règles détaillées](../../guide/resuming-file-workspaces/).

## Paramètres et propriétés

| Nom                        | Type                                                                                                                                                                                                         | Présence  | Rôle                                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `record`                   | `FileWorkspaceRecord`                                                                                                                                                                                        | Requis    | Description versionnée du workspace conservant sa propriété, sa génération settled et ses références de récupération.                   |
| `options`                  | `FileWorkspaceRecoveryOptions`                                                                                                                                                                               | Requis    | Révision inspectée, confirmations d’arrêt et choix explicites d’adoption des fichiers interrompus ou d’un montage modifié.              |
| `options.expectedRevision` | `string`                                                                                                                                                                                                     | Requis    | Révision obtenue par inspection ; la récupération refuse un enregistrement persisté modifié.                                            |
| `options.processesStopped` | `true`                                                                                                                                                                                                       | Requis    | Attestation explicite d’arrêt du précédent propriétaire et de ses processus ; jamais déduite d’une expiration de heartbeat.             |
| `options.sandboxProvider`  | `SandboxProvider \| undefined`                                                                                                                                                                               | Optionnel | Provider d’exécution disposant de la capacité de liaison de fichiers requise ; les providers legacy restent utilisables pour Git.       |
| `options.runtime`          | `WorkspaceRuntimeOptions \| undefined`                                                                                                                                                                       | Optionnel | Répertoire de contrôle et namespace logique, séparés des fichiers du workspace.                                                         |
| `options.retention`        | `WorkspaceRetention \| undefined`                                                                                                                                                                            | Optionnel | run nettoie le travail possédé réussi, local le conserve, portable exige en plus un Transport et un namespace explicites.               |
| `options.portable`         | `boolean \| undefined`                                                                                                                                                                                       | Optionnel | Restaure un snapshot vérifié dans une nouvelle matérialisation possédée ; les sources montées doivent rester accessibles et inchangées. |
| `options.recover`          | `{ readonly processesStopped: true; readonly expectedRevision?: string; readonly allocationReleased?: true; readonly adoptInterruptedFiles?: boolean; readonly adoptMountedSource?: boolean; } \| undefined` | Optionnel | Autorisation explicite de récupération après arrêt des processus ; le replay interrompu reste une décision distincte du workflow.       |

## Retour

`Promise<FileWorkspace>`

## Signature

```ts
export declare function recoverFileWorkspace(
  record: FileWorkspaceRecord,
  options: FileWorkspaceRecoveryOptions,
): Promise<FileWorkspace>;
```

## Contrats associés

- [FileWorkspace](../fileworkspace/)
- [FileWorkspaceRecord](../fileworkspacerecord/)
- [FileWorkspaceRecoveryOptions](../fileworkspacerecoveryoptions/)
