---
title: "attach"
description: "attach — Outpost API"
sidebar:
  order: 10
---

Contrat public de **attach**. Consultez le [guide commandes et terminal](../../guide/environment/commands/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { attach } from "@elie-laloum/outpost";
```

## Rôle et comportement

Exécuter un processus ou attacher une session interactive native avec possession explicite des flux.

Command renvoie les statuts non nuls ; l’appelant doit les vérifier. Attach exige un provider interactif compatible. Vercel rejette l’attachement.

[Exemple complet et règles détaillées](../../guide/environment/commands/).

## Paramètres et propriétés

| Nom                          | Type                                                                                                 | Présence  | Rôle                                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`                    | `SandboxOptions & AttachOptions & RequiredAgent`                                                     | Requis    | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.includeUncommitted` | `boolean \| undefined`                                                                               | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.agent`              | `AgentAdapter`                                                                                       | Optionnel | Adapter natif de l’agent de code.                                                             |
| `options.provider`           | `SandboxProvider \| undefined`                                                                       | Optionnel | Backend de l’environnement d’exécution.                                                       |
| `options.workspace`          | `Workspace \| undefined`                                                                             | Optionnel | Workspace Git appartenant à l’appelant ; exclut un nouveau choix de dépôt/branche.            |
| `options.hooks`              | `LifecycleHooks \| undefined`                                                                        | Optionnel | Commandes de cycle de vie dans l’ordre déclaré.                                               |
| `options.signal`             | `AbortSignal \| undefined`                                                                           | Optionnel | Annulation coopérative de cette opération.                                                    |
| `options.logging`            | `Logging \| undefined`                                                                               | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.bootstrap`          | `boolean \| undefined`                                                                               | Optionnel | Indique si un agent sélectionné absent peut être installé automatiquement.                    |
| `options.conversationHome`   | `string \| undefined`                                                                                | Optionnel | Home hôte utilisé pour le stockage des transcripts natifs.                                    |
| `options.storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined`                                             | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.repository`         | `string \| undefined`                                                                                | Optionnel | Checkout Git hôte ciblé.                                                                      |
| `options.branch`             | `BranchPolicy \| undefined`                                                                          | Optionnel | Politique de workspace Git ou identité de branche résultante selon ce contrat.                |
| `options.copies`             | `readonly string[] \| undefined`                                                                     | Optionnel | Entrées relatives au dépôt copiées dans le workspace.                                         |
| `options.limits`             | `StageLimits \| undefined`                                                                           | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.label`              | `string \| undefined`                                                                                | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.ask`                | `VariableQuestion \| undefined`                                                                      | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.brief`              | `Brief \| undefined`                                                                                 | Optionnel | Entrée de tâche textuelle littérale ou provenant d’un fichier.                                |
| `options.continuation`       | `{ readonly id: string; readonly fork?: boolean; } \| undefined`                                     | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.terminal`           | `{ readonly input?: Readable; readonly output?: Writable; readonly error?: Writable; } \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |

## Retour

`Promise<AttachResult>`

## Signature

```ts
export declare function attach(
  options: SandboxOptions & AttachOptions & RequiredAgent,
): Promise<AttachResult>;
```

## Contrats associés

- [AttachOptions](../attachoptions/)
- [AttachResult](../attachresult/)
- [RequiredAgent](../support-requiredagent/)
- [SandboxOptions](../sandboxoptions/)
