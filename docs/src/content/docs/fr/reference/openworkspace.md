---
title: "openWorkspace"
description: "openWorkspace — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { openWorkspace } from "@elie-laloum/outpost";
```

## Rôle et comportement

Prend le verrou du dépôt et prépare le checkout choisi par la politique de branche. Le workspace renvoyé peut posséder plusieurs sandboxes successives et reste ouvert jusqu’à sa fermeture explicite. integrate applique ses changements de branche ; close préserve le travail dont la suppression serait risquée.

[Exemple complet et règles détaillées](../../guide/repository-and-branch/).

## Paramètres et propriétés

| Nom                    | Type                                                     | Présence  | Rôle                                                                                                                                                                                                                           |
| ---------------------- | -------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`              | `WorkspaceOptions \| undefined`                          | Optionnel | Réglages de dépôt, politique de branche, entrées copiées, hooks et admission de stockage.                                                                                                                                      |
| `options.observation`  | `ObservationHub \| undefined`                            | Optionnel | Hub facultatif appartenant à l’appelant pour les opérations de workspace, allocation, transfert et nettoyage ; créer un workspace ne ferme pas le hub.                                                                         |
| `options.storageQuota` | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optionnel | Limites d’admission et réservation demandée pour le stockage dans .outpost du dépôt.                                                                                                                                           |
| `options.signal`       | `AbortSignal \| undefined`                               | Optionnel | Annulation coopérative de cette opération.                                                                                                                                                                                     |
| `options.repository`   | `string \| undefined`                                    | Optionnel | Checkout Git hôte ciblé.                                                                                                                                                                                                       |
| `options.branch`       | `BranchPolicy \| undefined`                              | Optionnel | Choisit le checkout courant, une branche de travail nommée conservée ou une branche préparée pour intégration.                                                                                                                 |
| `options.copies`       | `readonly string[] \| undefined`                         | Optionnel | Entrées relatives au dépôt copiées dans le workspace.                                                                                                                                                                          |
| `options.limits`       | `StageLimits \| undefined`                               | Optionnel | Délais de copie, préparation Git, collecte des commits et intégration, en millisecondes.                                                                                                                                       |
| `options.label`        | `string \| undefined`                                    | Optionnel | Libellé lisible utilisé dans les rapports d’exécution.                                                                                                                                                                         |
| `options.hooks`        | `LifecycleHooks \| undefined`                            | Optionnel | Commandes de cycle de vie : workspaceReady s'exécute sur l'hôte une fois le worktree créé ; hostReady (dans l'ordre, sur l'hôte) et sandboxReady (en parallèle, dans la sandbox) s'exécutent simultanément après l'allocation. |

## Retour

`Promise<Workspace>`

## Signature

```ts
export declare function openWorkspace(
  options?: WorkspaceOptions,
): Promise<Workspace>;
```

## Contrats associés

- [Workspace](../workspace/)
- [WorkspaceOptions](../workspaceoptions/)
