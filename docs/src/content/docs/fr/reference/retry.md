---
title: "Retry"
description: "Retry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Retry } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                                                          | Présence  | Rôle                                                                                                                                                                                                               |
| ------------ | ------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `attempts`   | `number`                                                      | Requis    | Nombre maximal total de tentatives, première exécution comprise.                                                                                                                                                   |
| `delayMs`    | `number \| undefined`                                         | Optionnel | Délai de base en millisecondes avant une reprise ; zéro par défaut. Le backoff exponentiel le double après chaque tentative échouée de cet appel à start().                                                        |
| `backoff`    | `"fixed" \| "exponential" \| undefined`                       | Optionnel | Stratégie de délai : fixed par défaut, ou exponential avec un facteur deux. Ne change ni l’admission des tentatives ni le prédicat accepts.                                                                        |
| `maxDelayMs` | `number \| undefined`                                         | Optionnel | Plafond local positif ou nul, appliqué avant l’aléa. Vaut 30000 ms par défaut en mode exponentiel ; les délais fixes n’ont pas de plafond supplémentaire. Un minimum serveur retryAfterMs valide peut le dépasser. |
| `jitter`     | `"none" \| "full" \| undefined`                               | Optionnel | Aléa : none par défaut ; full tire uniformément entre zéro et le délai local plafonné. Le minimum serveur est appliqué ensuite et le résultat arrondi à la milliseconde supérieure.                                |
| `accepts`    | `((error: unknown, attempt: number) => boolean) \| undefined` | Optionnel | Prédicat déterminant si l’échec de la tentative donnée autorise une reprise.                                                                                                                                       |

## Signature

```ts
export interface Retry {
  readonly attempts: number;
  readonly delayMs?: number;
  readonly backoff?: "fixed" | "exponential";
  readonly maxDelayMs?: number;
  readonly jitter?: "none" | "full";
  readonly accepts?: (error: unknown, attempt: number) => boolean;
}
```
