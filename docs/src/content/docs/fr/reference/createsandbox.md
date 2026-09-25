---
title: "createSandbox"
description: "createSandbox — Outpost API"
sidebar:
  order: 10
---

Contrat public de **createSandbox**. Consultez le [guide sandboxes](../../guide/environment/lifecycle/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { createSandbox } from "@elie-laloum/outpost";
```

## Rôle et comportement

Acquérir un environnement d’exécution et le réutiliser pour des commandes ou tâches d’agent séquentielles.

Docker est le provider par défaut. Une seule opération peut posséder une sandbox à la fois. La fermeture est idempotente ; annuler une commande ne détruit pas à elle seule une sandbox chaude.

[Exemple complet et règles détaillées](../../guide/environment/lifecycle/).

## Paramètres et propriétés

| Nom                          | Type                                                     | Présence  | Rôle                                                                                          |
| ---------------------------- | -------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`                    | `SandboxOptions \| undefined`                            | Optionnel | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.includeUncommitted` | `boolean \| undefined`                                   | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.agent`              | `AgentAdapter \| undefined`                              | Optionnel | Adapter natif de l’agent de code.                                                             |
| `options.provider`           | `SandboxProvider \| undefined`                           | Optionnel | Backend de l’environnement d’exécution.                                                       |
| `options.workspace`          | `Workspace \| undefined`                                 | Optionnel | Workspace Git appartenant à l’appelant ; exclut un nouveau choix de dépôt/branche.            |
| `options.hooks`              | `LifecycleHooks \| undefined`                            | Optionnel | Commandes de cycle de vie dans l’ordre déclaré.                                               |
| `options.signal`             | `AbortSignal \| undefined`                               | Optionnel | Annulation coopérative de cette opération.                                                    |
| `options.logging`            | `Logging \| undefined`                                   | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.bootstrap`          | `boolean \| undefined`                                   | Optionnel | Indique si un agent sélectionné absent peut être installé automatiquement.                    |
| `options.conversationHome`   | `string \| undefined`                                    | Optionnel | Home hôte utilisé pour le stockage des transcripts natifs.                                    |
| `options.storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.repository`         | `string \| undefined`                                    | Optionnel | Checkout Git hôte ciblé.                                                                      |
| `options.branch`             | `BranchPolicy \| undefined`                              | Optionnel | Politique de workspace Git ou identité de branche résultante selon ce contrat.                |
| `options.copies`             | `readonly string[] \| undefined`                         | Optionnel | Entrées relatives au dépôt copiées dans le workspace.                                         |
| `options.limits`             | `StageLimits \| undefined`                               | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.label`              | `string \| undefined`                                    | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |

## Retour

`Promise<Sandbox>`

## Signature

```ts
export declare function createSandbox(
  options?: SandboxOptions,
): Promise<Sandbox>;
```

## Contrats associés

- [Sandbox](../sandbox/)
- [SandboxOptions](../sandboxoptions/)
