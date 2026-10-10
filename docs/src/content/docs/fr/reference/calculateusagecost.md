---
title: "calculateUsageCost"
description: "calculateUsageCost — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { calculateUsageCost } from "@elie-laloum/outpost";
```

## Rôle et comportement

Estime les frais des tokens dans la devise de la table à partir de Usage.models. Les tarifs sont par million de tokens. Les lectures et écritures du cache sont facturées une fois selon la convention d’entrée de chaque modèle ; les tarifs de cache omis utilisent celui de l’entrée. Un modèle, un tarif ou un usage manquant renvoie complete: false et une borne inférieure. Les compteurs ou tarifs invalides lèvent une erreur. Il s’agit d’une estimation, pas d’une facture.

[Exemple complet et règles détaillées](../../guide/estimating-costs/).

## Paramètres et propriétés

| Nom      | Type              | Présence | Rôle                                                           |
| -------- | ----------------- | -------- | -------------------------------------------------------------- |
| `usage`  | `Usage`           | Requis   | Usage agrégé des tokens avec compteurs facultatifs par modèle. |
| `prices` | `ModelPriceTable` | Requis   | Tarifs explicites et devise utilisés pour cette estimation.    |

## Retour

`UsageCost`

## Signature

```ts
export declare function calculateUsageCost(
  usage: Usage,
  prices: ModelPriceTable,
): UsageCost;
```

## Contrats associés

- [ModelPriceTable](../modelpricetable/)
- [Usage](../usage/)
- [UsageCost](../usagecost/)
