---
title: "WorkflowGate"
description: "WorkflowGate — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowGate**. Consultez le [guide approbations et pauses](../../guide/advanced/approvals/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkflowGate } from "@elie-laloum/outpost";
```

## Rôle et comportement

Persister une décision attendue et bloquer les dépendants jusqu’à sa soumission par un appelant de confiance.

Les noms d’acteurs sont des métadonnées de confiance, pas une authentification. Une pause ne nécessite aucun timer. Le rejet est définitif pour cette exécution. Un lot invalide échoue avant toute application.

[Exemple complet et règles détaillées](../../guide/advanced/approvals/).

## Paramètres et propriétés

| Nom      | Type                    | Présence | Rôle                                                                             |
| -------- | ----------------------- | -------- | -------------------------------------------------------------------------------- |
| `kind`   | `"approval" \| "pause"` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `prompt` | `string`                | Requis   | Instruction lisible présentée à cette étape.                                     |
| `actors` | `readonly string[]`     | Requis   | Identifiants d’acteurs de confiance, sans mécanisme d’authentification.          |

## Signature

```ts
export interface WorkflowGate {
  readonly kind: "approval" | "pause";
  readonly prompt: string;
  readonly actors: readonly string[];
}
```
