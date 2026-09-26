---
title: "HarnessToolExecution"
description: "HarnessToolExecution — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Conversations persistées, jeux d’outils fournis et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { HarnessToolExecution } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                       | Présence  | Rôle                                                                                                                        |
| ------------- | ------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------- |
| `concurrency` | `number \| undefined`                      | Optionnel | Nombre maximal d’outils en lecture seule exécutés en même temps ; les autres s’exécutent un par un. 4 par défaut.           |
| `deadlineMs`  | `number \| undefined`                      | Optionnel | Délai par appel en millisecondes ; 300 000 par défaut. Un appel expiré est signalé au modèle comme une erreur.              |
| `onError`     | `"return-to-model" \| "fail" \| undefined` | Optionnel | return-to-model (par défaut) renvoie une exception comme résultat en erreur ; fail fait échouer la passe avec cette erreur. |

## Signature

```ts
export interface HarnessToolExecution {
  readonly concurrency?: number;
  readonly deadlineMs?: number;
  readonly onError?: "return-to-model" | "fail";
}
```
