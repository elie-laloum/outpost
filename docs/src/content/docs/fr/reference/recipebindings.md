---
title: "RecipeBindings"
description: "RecipeBindings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeBindings } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                                   | Présence  | Rôle                                                                                                                                                                                                                                                              |
| --------- | ------------------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sandbox` | `Sandbox`                                              | Requis    | Sandbox ouverte appartenant à l’appelant, partagée par toutes les étapes de commande et d’agent. Gardez-la ouverte jusqu’à la fin de Workflow.start(), puis fermez-la ; la concurrence de la recette doit être 1.                                                 |
| `agents`  | `Readonly<Record<string, DispatchAgent>> \| undefined` | Optionnel | Agents Outpost composés, indexés par les noms exacts des champs agent du YAML. Les noms absents sont refusés à la déclaration ; les recettes de commandes seules peuvent omettre ce registre. L’authentification et les modèles restent dans les agents composés. |
| `inputs`  | `Readonly<Record<string, WorkflowJson>> \| undefined`  | Optionnel | Valeurs des paramètres déclarés ; le format 3 accepte aussi objets, tableaux et null JSON sans perte. Les paramètres sont validés avant les tâches.                                                                                                               |

## Signature

```ts
export interface RecipeBindings {
  readonly sandbox: Sandbox;
  readonly agents?: Readonly<Record<string, DispatchAgent>>;
  readonly inputs?: Readonly<Record<string, WorkflowJson>>;
}
```

## Contrats associés

- [DispatchAgent](../dispatchagent/)
- [Sandbox](../sandbox/)
- [WorkflowJson](../workflowjson/)
