---
title: "dispatch"
description: "dispatch — Outpost API"
sidebar:
  order: 10
---

Contrat public de **dispatch**. Consultez le [guide dispatch](../../guide/agents/dispatch/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { dispatch } from "@elie-laloum/outpost";
```

## Rôle et comportement

Exécuter une tâche d’agent et collecter texte, sortie typée, commits, usage et conversation native.

Une passe est la valeur par défaut. Les échecs de processus ou réponse rejettent la promesse. Épuiser les passes peut plutôt renvoyer completed: false. Le dispatch froid ferme ses ressources ; le dispatch chaud conserve sa sandbox.

[Exemple complet et règles détaillées](../../guide/agents/dispatch/).

## Paramètres et propriétés

| Nom                          | Type                                                             | Présence  | Rôle                                                                                          |
| ---------------------------- | ---------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`                    | `SandboxOptions & DispatchOptions<T> & RequiredAgent`            | Requis    | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.includeUncommitted` | `boolean \| undefined`                                           | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.agent`              | `AgentAdapter`                                                   | Optionnel | Adapter natif de l’agent de code.                                                             |
| `options.provider`           | `SandboxProvider \| undefined`                                   | Optionnel | Backend de l’environnement d’exécution.                                                       |
| `options.workspace`          | `Workspace \| undefined`                                         | Optionnel | Workspace Git appartenant à l’appelant ; exclut un nouveau choix de dépôt/branche.            |
| `options.hooks`              | `LifecycleHooks \| undefined`                                    | Optionnel | Commandes de cycle de vie dans l’ordre déclaré.                                               |
| `options.signal`             | `AbortSignal \| undefined`                                       | Optionnel | Annulation coopérative de cette opération.                                                    |
| `options.logging`            | `Logging \| undefined`                                           | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.bootstrap`          | `boolean \| undefined`                                           | Optionnel | Indique si un agent sélectionné absent peut être installé automatiquement.                    |
| `options.conversationHome`   | `string \| undefined`                                            | Optionnel | Home hôte utilisé pour le stockage des transcripts natifs.                                    |
| `options.storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined`         | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.repository`         | `string \| undefined`                                            | Optionnel | Checkout Git hôte ciblé.                                                                      |
| `options.branch`             | `BranchPolicy \| undefined`                                      | Optionnel | Politique de workspace Git ou identité de branche résultante selon ce contrat.                |
| `options.copies`             | `readonly string[] \| undefined`                                 | Optionnel | Entrées relatives au dépôt copiées dans le workspace.                                         |
| `options.limits`             | `StageLimits \| undefined`                                       | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.label`              | `string \| undefined`                                            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.brief`              | `Brief`                                                          | Requis    | Entrée de tâche textuelle littérale ou provenant d’un fichier.                                |
| `options.passes`             | `number \| undefined`                                            | Optionnel | Nombre maximal de passes d’agent ; une par défaut.                                            |
| `options.until`              | `string \| readonly string[] \| undefined`                       | Optionnel | Marqueur(s) de fin ; une liste vide désactive la détection.                                   |
| `options.idleMs`             | `number \| undefined`                                            | Optionnel | Intervalle silencieux maximal en millisecondes.                                               |
| `options.idleWarningMs`      | `number \| undefined`                                            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.settleMs`           | `number \| undefined`                                            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.deadlineMs`         | `number \| undefined`                                            | Optionnel | Échéance absolue de l’opération en millisecondes.                                             |
| `options.expansionMs`        | `number \| undefined`                                            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.continuation`       | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.response`           | `ResponseSpec<T> \| undefined`                                   | Optionnel | Analyseur et validateur de la réponse balisée.                                                |
| `options.observe`            | `((event: AgentObservation) => void) \| undefined`               | Optionnel | Callback d’observation ; ses erreurs sont isolées.                                            |
| `options.warn`               | `((message: string) => void) \| undefined`                       | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.diagnostic`         | `((message: string) => void) \| undefined`                       | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |

## Retour

`Promise<DispatchResult<T>>`

## Signature

```ts
export declare function dispatch<T = undefined>(
  options: SandboxOptions & DispatchOptions<T> & RequiredAgent,
): Promise<DispatchResult<T>>;
```

## Contrats associés

- [DispatchOptions](../dispatchoptions/)
- [DispatchResult](../dispatchresult/)
- [RequiredAgent](../support-requiredagent/)
- [SandboxOptions](../sandboxoptions/)
