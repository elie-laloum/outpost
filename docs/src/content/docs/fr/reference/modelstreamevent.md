---
title: "ModelStreamEvent"
description: "ModelStreamEvent — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ModelStreamEvent } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom       | Type                                                 | Présence          | Rôle                                                                                      |
| --------- | ---------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------- |
| `type`    | `"reasoning" \| "retry" \| "text-delta" \| "result"` | Requis            | text-delta pour un fragment du texte de réponse, ou result pour le résultat final.        |
| `text`    | `string`                                             | Selon la variante | Fragment du texte de réponse, dans l’ordre d’arrivée.                                     |
| `attempt` | `number`                                             | Selon la variante | Tentative de reprise signalée par le fournisseur ; l’émettre ne déclenche pas de reprise. |
| `message` | `string \| undefined`                                | Selon la variante | Diagnostic facultatif associé à la reprise signalée par le fournisseur.                   |
| `result`  | `ModelResult`                                        | Selon la variante | Résultat final normalisé, identique à celui d’une requête sans streaming.                 |

## Signature

```ts
export type ModelStreamEvent =
  | {
      readonly type: "reasoning";
      readonly text: string;
    }
  | {
      readonly type: "retry";
      readonly attempt: number;
      readonly message?: string;
    }
  | {
      readonly type: "text-delta";
      readonly text: string;
    }
  | {
      readonly type: "result";
      readonly result: ModelResult;
    };
```

## Contrats associés

- [ModelResult](../modelresult/)
