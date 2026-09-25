---
title: "Harness"
description: "Harness — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { Harness } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom             | Type                                   | Présence          | Rôle                                                                                                                                                                    |
| --------------- | -------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`          | `"cli" \| "custom"`                    | Requis            | Discriminant d’exécution : cli or custom.                                                                                                                               |
| `bind`          | `(model?: AgentModel) => AgentAdapter` | Selon la variante | Construit l’adaptateur CLI pour un AgentModel normalisé optionnel sans lancer le programme ; un raisonnement ou une limite de sortie non pris en charge est refusé ici. |
| `modelProvider` | `ModelProvider`                        | Selon la variante | Transport de requêtes utilisé par le callback ; aucun catalogue de modèles n’est imposé.                                                                                |
| `run`           | `HarnessRun`                           | Selon la variante | Implémentation de l’appelant renvoyant texte et usage optionnel. Elle doit respecter l’annulation et attendre ses opérations sandbox et modèle.                         |

## Signature

```ts
export type Harness = CliHarness | CustomHarness;
```

## Contrats associés

- [CliHarness](../cliharness/)
- [CustomHarness](../type-customharness/)
