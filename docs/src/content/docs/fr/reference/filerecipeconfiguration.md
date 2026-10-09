---
title: "FileRecipeConfiguration"
description: "FileRecipeConfiguration — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileRecipeConfiguration } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                                   | Présence  | Rôle                                                                                                                                                                                                                                                   |
| --------- | ------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sandbox` | `FileSandboxOptions`                                   | Requis    | Sandbox liée à ce workspace ; sa fermeture laisse ouvert un workspace emprunté.                                                                                                                                                                        |
| `agents`  | `Readonly<Record<string, DispatchAgent>> \| undefined` | Optionnel | Agents composés localement, indexés par les rôles référencés dans les tâches. La CLI refuse les rôles absents avant d’ouvrir une sandbox. Gardez modèles, identifiants et choix propres aux fournisseurs dans cette configuration locale de confiance. |

## Signature

```ts
export interface FileRecipeConfiguration extends Omit<
  RecipeConfiguration,
  "sandbox"
> {
  readonly sandbox: FileSandboxOptions;
}
```

## Contrats associés

- [RecipeConfiguration](../recipeconfiguration/)
