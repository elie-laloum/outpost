---
title: "HarnessToolExecution"
description: "HarnessToolExecution — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessToolExecution } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                       | Présence  | Rôle                                                                                                                                                                                                                        |
| ------------- | ------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `concurrency` | `number \| undefined`                      | Optionnel | Nombre maximal d’appels en lecture seule exécutés en parallèle, 4 par défaut. Les appels en lecture seule consécutifs d’une même réponse du modèle s’exécutent ensemble ; tout autre appel s’exécute seul, dans l’ordre.    |
| `deadlineMs`  | `number \| undefined`                      | Optionnel | Délai de chaque appel d’outil, 300000 par défaut (5 minutes). À expiration, le signal de l’outil est annulé et l’appel échoue avec le code timeout, traité selon onError.                                                   |
| `onError`     | `"return-to-model" \| "fail" \| undefined` | Optionnel | Effet d’un appel d’outil en échec, délai dépassé ou sous-agent en échec compris : return-to-model (par défaut) envoie le message d’erreur au modèle comme résultat en erreur ; fail fait échouer le tour avec cette erreur. |

## Signature

```ts
export interface HarnessToolExecution {
  readonly concurrency?: number;
  readonly deadlineMs?: number;
  readonly onError?: "return-to-model" | "fail";
}
```
