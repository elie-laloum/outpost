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
| `attempts`   | `number`                                                      | Requis    | Nombre maximal de tentatives, la première comprise ; entier positif. Le compte repart de zéro quand la tâche s’exécute à nouveau après une pause sur quota ou une reprise de checkpoint.                           |
| `delayMs`    | `number \| undefined`                                         | Optionnel | Attente en millisecondes avant chaque relance, 0 par défaut.                                                                                                                                                       |
| `backoff`    | `"fixed" \| "exponential" \| undefined`                       | Optionnel | Stratégie d’attente : fixed (par défaut) garde delayMs ; exponential le double après chaque tentative échouée.                                                                                                     |
| `maxDelayMs` | `number \| undefined`                                         | Optionnel | Plafond local positif ou nul, appliqué avant l’aléa. Vaut 30000 ms par défaut en mode exponentiel ; les délais fixes n’ont pas de plafond supplémentaire. Un minimum serveur retryAfterMs valide peut le dépasser. |
| `jitter`     | `"none" \| "full" \| undefined`                               | Optionnel | Aléa : none par défaut ; full tire uniformément entre zéro et le délai local plafonné. Le minimum serveur est appliqué ensuite et le résultat arrondi à la milliseconde supérieure.                                |
| `accepts`    | `((error: unknown, attempt: number) => boolean) \| undefined` | Optionnel | Reçoit l’erreur et le numéro de tentative ; renvoyer false fait échouer la tâche sans autre relance.                                                                                                               |

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
