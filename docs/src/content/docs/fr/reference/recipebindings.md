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

| Nom       | Type                                                                 | Présence  | Rôle                                                                                                                                                                                                                                                                                                                             |
| --------- | -------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sandbox` | `Sandbox`                                                            | Requis    | Sandbox ouverte appartenant à l’appelant, partagée par toutes les étapes de commande et d’agent. Gardez-la ouverte jusqu’à la fin de Workflow.start(), puis fermez-la ; la concurrence de la recette doit être 1.                                                                                                                |
| `agents`  | `Readonly<Record<string, DispatchAgent>> \| undefined`               | Optionnel | Agents Outpost composés, indexés par les noms exacts des champs agent du YAML. Les noms absents sont refusés à la déclaration ; les recettes de commandes seules peuvent omettre ce registre. L’authentification et les modèles restent dans les agents composés.                                                                |
| `inputs`  | `Readonly<Record<string, string \| number \| boolean>> \| undefined` | Optionnel | Valeurs scalaires explicites des paramètres de version 2, indexées par leurs noms déclarés. Les valeurs par défaut complètent les paramètres omis ; valeurs obligatoires absentes, noms inconnus, types incorrects et violations des enum échouent avant exécution. La substitution passe une seule fois et n’évalue aucun code. |

## Signature

```ts
export interface RecipeBindings {
  readonly sandbox: Sandbox;
  readonly agents?: Readonly<Record<string, DispatchAgent>>;
  readonly inputs?: Readonly<Record<string, string | number | boolean>>;
}
```

## Contrats associés

- [DispatchAgent](../dispatchagent/)
- [Sandbox](../sandbox/)
