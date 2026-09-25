---
title: "QueueRequest"
description: "QueueRequest — Outpost API"
sidebar:
  order: 10
---

Contrat public de **QueueRequest**. Consultez le [guide exécution distribuée](../../guide/advanced/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { QueueRequest } from "@elie-laloum/outpost";
```

## Rôle et comportement

Coordonner des tâches JSON durables via SQLite, un transport HTTP authentifié et des workers enregistrés.

Les effets sont au moins une fois. Un jeton périmé ne peut valider l’état de file, mais les effets externes peuvent se répéter. HTTP écoute loopback par défaut sans TLS. Un worker traite une tâche à la fois.

[Exemple complet et règles détaillées](../../guide/advanced/distributed/).

## Paramètres et propriétés

| Nom        | Type                  | Présence  | Rôle                                                                             |
| ---------- | --------------------- | --------- | -------------------------------------------------------------------------------- |
| `id`       | `string`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `handler`  | `string`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `input`    | `WorkflowJson`        | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `deadline` | `number \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface QueueRequest {
  readonly id: string;
  readonly handler: string;
  readonly input: WorkflowJson;
  readonly deadline?: number;
}
```

## Contrats associés

- [WorkflowJson](../workflowjson/)
