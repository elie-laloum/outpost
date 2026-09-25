---
title: "QueueClaim"
description: "QueueClaim — Outpost API"
sidebar:
  order: 10
---

Contrat public de **QueueClaim**. Consultez le [guide exécution distribuée](../../guide/advanced/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { QueueClaim } from "@elie-laloum/outpost";
```

## Rôle et comportement

Coordonner des tâches JSON durables via SQLite, un transport HTTP authentifié et des workers enregistrés.

Les effets sont au moins une fois. Un jeton périmé ne peut valider l’état de file, mais les effets externes peuvent se répéter. HTTP écoute loopback par défaut sans TLS. Un worker traite une tâche à la fois.

[Exemple complet et règles détaillées](../../guide/advanced/distributed/).

## Paramètres et propriétés

| Nom        | Type                | Présence | Rôle                                                                             |
| ---------- | ------------------- | -------- | -------------------------------------------------------------------------------- |
| `worker`   | `string`            | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `handlers` | `readonly string[]` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `leaseMs`  | `number`            | Requis   | Durée du bail worker en millisecondes.                                           |

## Signature

```ts
export interface QueueClaim {
  readonly worker: string;
  readonly handlers: readonly string[];
  readonly leaseMs: number;
}
```
