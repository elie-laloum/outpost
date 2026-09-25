---
title: "WorkflowGateOptions"
description: "WorkflowGateOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **WorkflowGateOptions**. Consultez le [guide approbations et pauses](../../guide/advanced/approvals/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { WorkflowGateOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Persister une décision attendue et bloquer les dépendants jusqu’à sa soumission par un appelant de confiance.

Les noms d’acteurs sont des métadonnées de confiance, pas une authentification. Une pause ne nécessite aucun timer. Le rejet est définitif pour cette exécution. Un lot invalide échoue avant toute application.

[Exemple complet et règles détaillées](../../guide/advanced/approvals/).

## Paramètres et propriétés

| Nom      | Type                                    | Présence  | Rôle                                                                    |
| -------- | --------------------------------------- | --------- | ----------------------------------------------------------------------- |
| `key`    | `string`                                | Requis    | Clé stable de tâche ou cache dans le contrat concerné.                  |
| `after`  | `readonly Task<unknown>[] \| undefined` | Optionnel | Dépendances déclarées dont les valeurs peuvent être lues.               |
| `prompt` | `string`                                | Requis    | Instruction lisible présentée à cette étape.                            |
| `actors` | `readonly string[]`                     | Requis    | Identifiants d’acteurs de confiance, sans mécanisme d’authentification. |

## Signature

```ts
export interface WorkflowGateOptions {
  readonly key: string;
  readonly after?: readonly Task[];
  readonly prompt: string;
  readonly actors: readonly string[];
}
```

## Contrats associés

- [Task](../task/)
