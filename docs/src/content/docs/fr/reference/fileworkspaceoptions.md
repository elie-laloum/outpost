---
title: "FileWorkspaceOptions"
description: "FileWorkspaceOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileWorkspaceOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type                                                     | Présence  | Rôle                                                                                                                              |
| -------------- | -------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `hooks`        | `LifecycleHooks \| undefined`                            | Optionnel | Commandes de préparation déclarées workspaceReady, hostReady et sandboxReady.                                                     |
| `storageQuota` | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optionnel | Réservation d’admission via Transport ; coordonne les writers coopérants sans imposer de quota physique de disque.                |
| `recovery`     | `FileWorkspaceRecoveryAuthorization \| undefined`        | Optionnel | Autorisation explicite de récupération après arrêt des processus ; le replay interrompu reste une décision distincte du workflow. |
| `inputs`       | `readonly WorkspaceInput[] \| undefined`                 | Optionnel | Entrées de fichiers explicites ; les paramètres JSON du workflow ne sont jamais écrits implicitement sur disque.                  |
| `source`       | `FileWorkspaceSource`                                    | Requis    | Source déclarée pour une ressource possédée ; exclusive de l’emprunt d’un workspace ouvert.                                       |
| `runtime`      | `WorkspaceRuntimeOptions \| undefined`                   | Optionnel | Répertoire de contrôle et namespace logique, séparés des fichiers du workspace.                                                   |
| `paths`        | `readonly string[] \| undefined`                         | Optionnel | Sélection explicite de chemins relatifs ; la sélection de copie n’applique pas implicitement .gitignore.                          |
| `retention`    | `WorkspaceRetention \| undefined`                        | Optionnel | run nettoie le travail possédé réussi, local le conserve, portable exige en plus un Transport et un namespace explicites.         |
| `signal`       | `AbortSignal \| undefined`                               | Optionnel | Signal d’annulation transmis à l’opération et à son groupe de processus ; les sandboxes réutilisables restent utilisables.        |

## Signature

```ts
export interface FileWorkspaceOptions {
  readonly hooks?: LifecycleHooks;
  readonly storageQuota?: Omit<StorageReservationOptions, "signal">;
  readonly recovery?: FileWorkspaceRecoveryAuthorization;
  readonly inputs?: readonly WorkspaceInput[];
  readonly source: FileWorkspaceSource;
  readonly runtime?: WorkspaceRuntimeOptions;
  readonly paths?: readonly string[];
  readonly retention?: WorkspaceRetention;
  readonly signal?: AbortSignal;
}
```

## Contrats associés

- [FileWorkspaceRecoveryAuthorization](../fileworkspacerecoveryauthorization/)
- [FileWorkspaceSource](../fileworkspacesource/)
- [WorkspaceInput](../workspaceinput/)
- [WorkspaceRetention](../workspaceretention/)
- [WorkspaceRuntimeOptions](../workspaceruntimeoptions/)
