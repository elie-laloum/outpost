---
title: "QueueServerOptions"
description: "QueueServerOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **QueueServerOptions**. Consultez le [guide exécution distribuée](../../guide/advanced/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { QueueServerOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Coordonner des tâches JSON durables via SQLite, un transport HTTP authentifié et des workers enregistrés.

Les effets sont au moins une fois. Un jeton périmé ne peut valider l’état de file, mais les effets externes peuvent se répéter. HTTP écoute loopback par défaut sans TLS. Un worker traite une tâche à la fois.

[Exemple complet et règles détaillées](../../guide/advanced/distributed/).

## Paramètres et propriétés

| Nom     | Type                  | Présence  | Rôle                                                                             |
| ------- | --------------------- | --------- | -------------------------------------------------------------------------------- |
| `queue` | `TaskQueue`           | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `token` | `string`              | Requis    | Identifiant de transport explicite ; jamais dans une URL.                        |
| `host`  | `string \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `port`  | `number \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface QueueServerOptions {
  readonly queue: TaskQueue;
  readonly token: string;
  readonly host?: string;
  readonly port?: number;
}
```

## Contrats associés

- [TaskQueue](../taskqueue/)
