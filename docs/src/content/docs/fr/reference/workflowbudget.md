---
title: "WorkflowBudget"
description: "WorkflowBudget — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowBudget } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                                                          | Présence  | Rôle                                                                                                                                                                                                                               |
| ---------- | ----------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prices`   | `ModelPriceTable \| undefined`                                                | Optionnel | Tarifs par million de tokens. Active l’attribution par modèle dans les helpers de tâches et ajoute cost à result.usage, même sans limite monétaire. Copiée au début de la comptabilisation.                                        |
| `cost`     | `{ readonly currency: "EUR" \| "USD"; readonly limit: number; } \| undefined` | Optionnel | Limite monétaire partagée avec currency et limit fini positif ou nul. Exige prices dans la même devise ; l’atteindre annule les tentatives actives et bloque les admissions. Un coût inconnu échoue même avec une limite attempts. |
| `attempts` | `number \| undefined`                                                         | Optionnel | Nombre maximal de tentatives admises sur l’exécution et ses reprises de checkpoint. L’atteindre annule les tâches non démarrées.                                                                                                   |
| `usage`    | `Partial<Omit<Usage, "models" \| "complete">> \| undefined`                   | Optionnel | Limites de tokens par compteur (input, cached, cacheCreated, output). En atteindre une annule aussi les tâches en cours ; un usage signalé tardivement peut la dépasser.                                                           |

## Signature

```ts
export interface WorkflowBudget {
  readonly prices?: ModelPriceTable;
  readonly cost?: {
    readonly currency: "EUR" | "USD";
    readonly limit: number;
  };
  readonly attempts?: number;
  readonly usage?: Partial<Omit<Usage, "complete" | "models">>;
}
```

## Contrats associés

- [ModelPriceTable](../modelpricetable/)
- [Usage](../usage/)
