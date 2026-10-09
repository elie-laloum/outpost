---
title: "MixedRecipeBindings"
description: "MixedRecipeBindings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { MixedRecipeBindings } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                                   | Présence  | Rôle                                                                                                                                                                                                                                                              |
| --------- | ------------------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sandbox` | `FileSandbox \| Sandbox`                               | Requis    | Sandbox liée à ce workspace ; sa fermeture laisse ouvert un workspace emprunté.                                                                                                                                                                                   |
| `inputs`  | `Readonly<Record<string, WorkflowJson>> \| undefined`  | Optionnel | Valeurs des paramètres déclarés ; le format 3 accepte aussi objets, tableaux et null JSON sans perte. Les paramètres sont validés avant les tâches.                                                                                                               |
| `agents`  | `Readonly<Record<string, DispatchAgent>> \| undefined` | Optionnel | Agents Outpost composés, indexés par les noms exacts des champs agent du YAML. Les noms absents sont refusés à la déclaration ; les recettes de commandes seules peuvent omettre ce registre. L’authentification et les modèles restent dans les agents composés. |

## Signature

```ts
export interface MixedRecipeBindings extends Omit<RecipeBindings, "sandbox"> {
  readonly sandbox: Sandbox | FileSandbox;
}
```

## Contrats associés

- [FileSandbox](../filesandbox/)
- [RecipeBindings](../recipebindings/)
- [Sandbox](../sandbox/)
