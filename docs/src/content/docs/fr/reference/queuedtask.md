---
title: "queuedTask"
description: "queuedTask — Outpost API"
sidebar:
  order: 10
---

Contrat public de **queuedTask**. Consultez le [guide exécution distribuée](../../guide/advanced/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { queuedTask } from "@elie-laloum/outpost";
```

## Rôle et comportement

Coordonner des tâches JSON durables via SQLite, un transport HTTP authentifié et des workers enregistrés.

Les effets sont au moins une fois. Un jeton périmé ne peut valider l’état de file, mais les effets externes peuvent se répéter. HTTP écoute loopback par défaut sans TLS. Un worker traite une tâche à la fois.

[Exemple complet et règles détaillées](../../guide/advanced/distributed/).

## Paramètres et propriétés

| Nom                 | Type                                                                   | Présence  | Rôle                                                                                          |
| ------------------- | ---------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`           | `QueuedTaskOptions<T>`                                                 | Requis    | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.after`     | `readonly Task<unknown>[] \| undefined`                                | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                                     |
| `options.key`       | `string`                                                               | Requis    | Clé stable de tâche ou cache dans le contrat concerné.                                        |
| `options.gate`      | `WorkflowGate \| undefined`                                            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optionnel | Prédicat évalué avant la première tentative.                                                  |
| `options.retry`     | `Retry \| undefined`                                                   | Optionnel | Politique explicite de reprise ; les effets peuvent se répéter.                               |
| `options.timeoutMs` | `number \| undefined`                                                  | Optionnel | Délai en millisecondes pour l’opération concernée.                                            |
| `options.queue`     | `TaskQueue`                                                            | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.handler`   | `string`                                                               | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.input`     | `(context: TaskContext) => WorkflowJson`                               | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.decode`    | `(value: WorkflowJson) => T`                                           | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.deadline`  | `number \| undefined`                                                  | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.pollMs`    | `number \| undefined`                                                  | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |

## Retour

`Task<T>`

## Signature

```ts
export declare function queuedTask<T>(options: QueuedTaskOptions<T>): Task<T>;
```

## Contrats associés

- [QueuedTaskOptions](../queuedtaskoptions/)
- [Task](../task/)
