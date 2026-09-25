---
title: "QueueClientOptions"
description: "QueueClientOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **QueueClientOptions**. Consultez le [guide exécution distribuée](../../guide/advanced/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { QueueClientOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Coordonner des tâches JSON durables via SQLite, un transport HTTP authentifié et des workers enregistrés.

Les effets sont au moins une fois. Un jeton périmé ne peut valider l’état de file, mais les effets externes peuvent se répéter. HTTP écoute loopback par défaut sans TLS. Un worker traite une tâche à la fois.

[Exemple complet et règles détaillées](../../guide/advanced/distributed/).

## Paramètres et propriétés

| Nom         | Type                  | Présence  | Rôle                                                                             |
| ----------- | --------------------- | --------- | -------------------------------------------------------------------------------- |
| `url`       | `string`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `token`     | `string`              | Requis    | Identifiant de transport explicite ; jamais dans une URL.                        |
| `timeoutMs` | `number \| undefined` | Optionnel | Délai en millisecondes pour l’opération concernée.                               |

## Signature

```ts
export interface QueueClientOptions {
  readonly url: string;
  readonly token: string;
  readonly timeoutMs?: number;
}
```
