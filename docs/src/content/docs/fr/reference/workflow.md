---
title: "workflow"
description: "workflow — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { workflow } from "@elie-laloum/outpost";
```

## Rôle et comportement

Valide les clés, dépendances et cycles d’un graphe nommé, puis renvoie une définition de workflow réutilisable. start ordonnance les tâches avec concurrence, annulation et checkpoints optionnels ; diagram produit le graphe de dépendances en Mermaid.

[Exemple complet et règles détaillées](../../guide/workflows/graph/).

## Paramètres et propriétés

| Nom     | Type                       | Présence | Rôle                                                                                    |
| ------- | -------------------------- | -------- | --------------------------------------------------------------------------------------- |
| `name`  | `string`                   | Requis   | Nom de la définition de workflow, inclus dans ses rapports d’exécution.                 |
| `tasks` | `readonly Task<unknown>[]` | Requis   | Définitions de tâches composant le graphe, comprenant toutes les dépendances déclarées. |

## Retour

`Workflow`

## Signature

```ts
export declare function workflow(
  name: string,
  tasks: readonly Task[],
): Workflow;
```

## Contrats associés

- [Task](../type-task/)
- [Workflow](../type-workflow/)
