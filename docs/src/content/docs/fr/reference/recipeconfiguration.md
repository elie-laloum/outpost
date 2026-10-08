---
title: "RecipeConfiguration"
description: "RecipeConfiguration — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecipeConfiguration } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                                   | Présence  | Rôle                                                                                                                                                                                                                                                                                 |
| --------- | ------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sandbox` | `SandboxOptions`                                       | Requis    | Options de création de sandbox réutilisées par la CLI des recettes. Les paramètres et agents requis sont vérifiés avant allocation ; la CLI fournit l’annulation, possède la sandbox créée, intègre le travail réussi selon sa politique de branche et préserve le travail en échec. |
| `agents`  | `Readonly<Record<string, DispatchAgent>> \| undefined` | Optionnel | Agents composés localement, indexés par les rôles référencés dans les tâches. La CLI refuse les rôles absents avant d’ouvrir une sandbox. Gardez modèles, identifiants et choix propres aux fournisseurs dans cette configuration locale de confiance.                               |

## Signature

```ts
export interface RecipeConfiguration {
  readonly sandbox: SandboxOptions;
  readonly agents?: Readonly<Record<string, DispatchAgent>>;
}
```

## Contrats associés

- [DispatchAgent](../dispatchagent/)
- [SandboxOptions](../sandboxoptions/)
