---
title: "WorkflowPauseRequest"
description: "WorkflowPauseRequest — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowPauseRequest**. Consultez le [guide approbations et pauses](../../guide/advanced/approvals/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkflowPauseRequest } from "@elie-laloum/outpost";
```

## Rôle et comportement

Persister une décision attendue et bloquer les dépendants jusqu’à sa soumission par un appelant de confiance.

Les noms d’acteurs sont des métadonnées de confiance, pas une authentification. Une pause ne nécessite aucun timer. Le rejet est définitif pour cette exécution. Un lot invalide échoue avant toute application.

[Exemple complet et règles détaillées](../../guide/advanced/approvals/).

## Paramètres et propriétés

| Nom           | Type                    | Présence | Rôle                                                                             |
| ------------- | ----------------------- | -------- | -------------------------------------------------------------------------------- |
| `id`          | `string`                | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `requestedAt` | `string`                | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `kind`        | `"approval" \| "pause"` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `prompt`      | `string`                | Requis   | Instruction lisible présentée à cette étape.                                     |
| `actors`      | `readonly string[]`     | Requis   | Identifiants d’acteurs de confiance, sans mécanisme d’authentification.          |

## Signature

```ts
export interface WorkflowPauseRequest extends WorkflowGate {
  readonly id: string;
  readonly requestedAt: string;
}
```

## Contrats associés

- [WorkflowGate](../workflowgate/)
