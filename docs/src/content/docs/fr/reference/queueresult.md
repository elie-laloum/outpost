---
title: "QueueResult"
description: "QueueResult — Outpost API"
sidebar:
  order: 10
---

Contrat public de **QueueResult**. Consultez le [guide exécution distribuée](../../guide/advanced/distributed/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { QueueResult } from "@elie-laloum/outpost";
```

## Rôle et comportement

Coordonner des tâches JSON durables via SQLite, un transport HTTP authentifié et des workers enregistrés.

Les effets sont au moins une fois. Un jeton périmé ne peut valider l’état de file, mais les effets externes peuvent se répéter. HTTP écoute loopback par défaut sans TLS. Un worker traite une tâche à la fois.

[Exemple complet et règles détaillées](../../guide/advanced/distributed/).

## Paramètres et propriétés

| Nom     | Type                  | Présence  | Rôle                                                                             |
| ------- | --------------------- | --------- | -------------------------------------------------------------------------------- |
| `value` | `WorkflowJson`        | Requis    | Valeur typée produite ou consommée par ce contrat.                               |
| `usage` | `Usage \| undefined`  | Optionnel | Compteurs d’usage rapportés ; aucune estimation monétaire.                       |
| `error` | `string \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface QueueResult {
  readonly value: WorkflowJson;
  readonly usage?: Usage;
  readonly error?: string;
}
```

## Contrats associés

- [Usage](../usage/)
- [WorkflowJson](../workflowjson/)
