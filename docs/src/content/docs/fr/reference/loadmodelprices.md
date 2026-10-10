---
title: "loadModelPrices"
description: "loadModelPrices — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { loadModelPrices } from "@elie-laloum/outpost";
```

## Rôle et comportement

Charge une fois un catalogue models.dev ou OpenRouter avec annulation, délai et taille bornés, puis renvoie une table figée pour les alias de modèles explicitement choisis. Les prix des catalogues sont en USD ; EUR exige un taux fourni par l’appelant. Convertit les tarifs OpenRouter par token en tarifs par million. Refuse les modèles absents, tarifs invalides, paliers et frais supplémentaires non pris en charge ; aucun rafraîchissement ni accès réseau ne se produit pendant la comptabilisation du workflow. La table estime uniquement les frais des tokens ; taxes, remises, outils, images et autres dimensions de facturation sont exclus.

[Exemple complet et règles détaillées](../../guide/estimating-costs/).

## Paramètres et propriétés

| Nom                        | Type                                        | Présence  | Rôle                                                                                                                                     |
| -------------------------- | ------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                  | `ModelPricesOptions`                        | Requis    | Sélection du catalogue, alias des modèles, conversion de devise et paramètres HTTP bornés.                                               |
| `options.source`           | `"models.dev" \| "openrouter" \| undefined` | Optionnel | Catalogue public à charger : models.dev par défaut ou openrouter.                                                                        |
| `options.provider`         | `string \| undefined`                       | Optionnel | Identifiant de provider models.dev obligatoire ; ignoré pour OpenRouter.                                                                 |
| `options.models`           | `Readonly<Record<string, string>>`          | Requis    | Noms de modèles Outpost associés aux identifiants exacts du catalogue choisi ; charge uniquement ces tarifs.                             |
| `options.currency`         | `"EUR" \| "USD" \| undefined`               | Optionnel | Devise de sortie, USD par défaut ; EUR exige usdExchangeRate.                                                                            |
| `options.usdExchangeRate`  | `number \| undefined`                       | Optionnel | Montant en EUR fourni par l’appelant pour un USD lorsque currency vaut EUR. USD accepte uniquement 1.                                    |
| `options.url`              | `string \| undefined`                       | Optionnel | Endpoint HTTP(S) absolu facultatif du catalogue, sans identifiants intégrés ni fragment. Utilise l’URL publique de la source par défaut. |
| `options.signal`           | `AbortSignal \| undefined`                  | Optionnel | Annule la requête du catalogue et la lecture du corps.                                                                                   |
| `options.timeoutMs`        | `number \| undefined`                       | Optionnel | Délai total de requête du catalogue, 15000 ms par défaut.                                                                                |
| `options.maxResponseBytes` | `number \| undefined`                       | Optionnel | Taille maximale de réponse du catalogue, 32 Mio par défaut.                                                                              |

## Retour

`Promise<ModelPriceTable>`

## Signature

```ts
export declare function loadModelPrices(
  options: ModelPricesOptions,
): Promise<ModelPriceTable>;
```

## Contrats associés

- [ModelPricesOptions](../modelpricesoptions/)
- [ModelPriceTable](../modelpricetable/)
