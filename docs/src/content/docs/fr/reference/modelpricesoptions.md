---
title: "ModelPricesOptions"
description: "ModelPricesOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ModelPricesOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                | Type                                        | Présence  | Rôle                                                                                                                                     |
| ------------------ | ------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `source`           | `"models.dev" \| "openrouter" \| undefined` | Optionnel | Catalogue public à charger : models.dev par défaut ou openrouter.                                                                        |
| `provider`         | `string \| undefined`                       | Optionnel | Identifiant de provider models.dev obligatoire ; ignoré pour OpenRouter.                                                                 |
| `models`           | `Readonly<Record<string, string>>`          | Requis    | Noms de modèles Outpost associés aux identifiants exacts du catalogue choisi ; charge uniquement ces tarifs.                             |
| `currency`         | `"EUR" \| "USD" \| undefined`               | Optionnel | Devise de sortie, USD par défaut ; EUR exige usdExchangeRate.                                                                            |
| `usdExchangeRate`  | `number \| undefined`                       | Optionnel | Montant en EUR fourni par l’appelant pour un USD lorsque currency vaut EUR. USD accepte uniquement 1.                                    |
| `url`              | `string \| undefined`                       | Optionnel | Endpoint HTTP(S) absolu facultatif du catalogue, sans identifiants intégrés ni fragment. Utilise l’URL publique de la source par défaut. |
| `signal`           | `AbortSignal \| undefined`                  | Optionnel | Annule la requête du catalogue et la lecture du corps.                                                                                   |
| `timeoutMs`        | `number \| undefined`                       | Optionnel | Délai total de requête du catalogue, 15000 ms par défaut.                                                                                |
| `maxResponseBytes` | `number \| undefined`                       | Optionnel | Taille maximale de réponse du catalogue, 32 Mio par défaut.                                                                              |

## Signature

```ts
export interface ModelPricesOptions {
  readonly source?: "models.dev" | "openrouter";
  readonly provider?: string;
  readonly models: Readonly<Record<string, string>>;
  readonly currency?: "EUR" | "USD";
  readonly usdExchangeRate?: number;
  readonly url?: string;
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
  readonly maxResponseBytes?: number;
}
```
