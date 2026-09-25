---
title: "QueueWorkerOptions"
description: "QueueWorkerOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **QueueWorkerOptions**. Consultez le [guide exécution distribuée](../../guide/advanced/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { QueueWorkerOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Coordonner des tâches JSON durables via SQLite, un transport HTTP authentifié et des workers enregistrés.

Les effets sont au moins une fois. Un jeton périmé ne peut valider l’état de file, mais les effets externes peuvent se répéter. HTTP écoute loopback par défaut sans TLS. Un worker traite une tâche à la fois.

[Exemple complet et règles détaillées](../../guide/advanced/distributed/).

## Paramètres et propriétés

| Nom        | Type                                     | Présence  | Rôle                                                                             |
| ---------- | ---------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `queue`    | `TaskQueue`                              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `worker`   | `string`                                 | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `handlers` | `Readonly<Record<string, QueueHandler>>` | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `signal`   | `AbortSignal`                            | Requis    | Annulation coopérative de cette opération.                                       |
| `leaseMs`  | `number \| undefined`                    | Optionnel | Durée du bail worker en millisecondes.                                           |
| `pollMs`   | `number \| undefined`                    | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface QueueWorkerOptions {
  readonly queue: TaskQueue;
  readonly worker: string;
  readonly handlers: Readonly<Record<string, QueueHandler>>;
  readonly signal: AbortSignal;
  readonly leaseMs?: number;
  readonly pollMs?: number;
}
```

## Contrats associés

- [QueueHandler](../queuehandler/)
- [TaskQueue](../taskqueue/)
