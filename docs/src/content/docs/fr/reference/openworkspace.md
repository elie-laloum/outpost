---
title: "openWorkspace"
description: "openWorkspace — Outpost API"
sidebar:
  order: 10
---

Contrat public de **openWorkspace**. Consultez le [guide workspaces](../../guide/environment/workspaces/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { openWorkspace } from "@elie-laloum/outpost";
```

## Rôle et comportement

Posséder un checkout, une branche et un verrou indépendamment de la durée de vie de la sandbox.

Le dépôt vaut par défaut le dossier courant. Les branches nommées conservent les commits ; les worktrees sales ou détachés restent récupérables. Fermez la sandbox avant le workspace appartenant à l’appelant.

[Exemple complet et règles détaillées](../../guide/environment/workspaces/).

## Paramètres et propriétés

| Nom                    | Type                                                     | Présence  | Rôle                                                                                          |
| ---------------------- | -------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`              | `WorkspaceOptions \| undefined`                          | Optionnel | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.storageQuota` | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.signal`       | `AbortSignal \| undefined`                               | Optionnel | Annulation coopérative de cette opération.                                                    |
| `options.repository`   | `string \| undefined`                                    | Optionnel | Checkout Git hôte ciblé.                                                                      |
| `options.branch`       | `BranchPolicy \| undefined`                              | Optionnel | Politique de workspace Git ou identité de branche résultante selon ce contrat.                |
| `options.copies`       | `readonly string[] \| undefined`                         | Optionnel | Entrées relatives au dépôt copiées dans le workspace.                                         |
| `options.limits`       | `StageLimits \| undefined`                               | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.label`        | `string \| undefined`                                    | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.hooks`        | `LifecycleHooks \| undefined`                            | Optionnel | Commandes de cycle de vie dans l’ordre déclaré.                                               |

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
