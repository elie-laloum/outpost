---
title: "defineWorkflow"
description: "defineWorkflow — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineWorkflow } from "@elie-laloum/outpost";
```

## Rôle et comportement

Valide une liste de tâches nommée et renvoie un Workflow figé dont start() exécute le graphe et diagram() le dessine en Mermaid. Lève une erreur pour un nom vide, une clé en double, une dépendance absente de la liste, un cycle, ou une gate avec condition, retry, délai ou cache.

[Exemple complet et règles détaillées](../../guide/task-dependencies/).

## Paramètres et propriétés

| Nom     | Type                       | Présence | Rôle                                                                                           |
| ------- | -------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `name`  | `string`                   | Requis   | Nom du workflow, non vide ; il fait partie de l’identité du checkpoint et de chaque événement. |
| `tasks` | `readonly Task<unknown>[]` | Requis   | Toutes les tâches du graphe ; chaque dépendance doit aussi figurer dans la liste.              |

## Retour

`Workflow`

## Signature

```ts
export declare function defineWorkflow(
  name: string,
  tasks: readonly Task[],
): Workflow;
```

## Contrats associés

- [Task](../type-task/)
- [Workflow](../type-workflow/)
