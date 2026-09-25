---
title: "QueuedTaskOptions"
description: "QueuedTaskOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **QueuedTaskOptions**. Consultez le [guide exécution distribuée](../../guide/advanced/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { QueuedTaskOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Coordonner des tâches JSON durables via SQLite, un transport HTTP authentifié et des workers enregistrés.

Les effets sont au moins une fois. Un jeton périmé ne peut valider l’état de file, mais les effets externes peuvent se répéter. HTTP écoute loopback par défaut sans TLS. Un worker traite une tâche à la fois.

[Exemple complet et règles détaillées](../../guide/advanced/distributed/).

## Paramètres et propriétés

| Nom         | Type                                                                   | Présence  | Rôle                                                                             |
| ----------- | ---------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `after`     | `readonly Task<unknown>[] \| undefined`                                | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.                        |
| `key`       | `string`                                                               | Requis    | Clé stable de tâche ou cache dans le contrat concerné.                           |
| `gate`      | `WorkflowGate \| undefined`                                            | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optionnel | Prédicat évalué avant la première tentative.                                     |
| `retry`     | `Retry \| undefined`                                                   | Optionnel | Politique explicite de reprise ; les effets peuvent se répéter.                  |
| `timeoutMs` | `number \| undefined`                                                  | Optionnel | Délai en millisecondes pour l’opération concernée.                               |
| `queue`     | `TaskQueue`                                                            | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `handler`   | `string`                                                               | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `input`     | `(context: TaskContext) => WorkflowJson`                               | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `decode`    | `(value: WorkflowJson) => T`                                           | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `deadline`  | `number \| undefined`                                                  | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `pollMs`    | `number \| undefined`                                                  | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export type QueuedTaskOptions<T> = Omit<TaskOptions<T>, "perform"> & {
  readonly queue: TaskQueue;
  readonly handler: string;
  readonly input: (context: TaskContext) => WorkflowJson;
  readonly decode: (value: WorkflowJson) => T;
  readonly deadline?: number;
  readonly pollMs?: number;
};
```

## Contrats associés

- [TaskContext](../taskcontext/)
- [TaskOptions](../taskoptions/)
- [TaskQueue](../taskqueue/)
- [WorkflowJson](../workflowjson/)
