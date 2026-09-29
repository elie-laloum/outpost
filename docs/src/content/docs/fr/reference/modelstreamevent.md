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

| Nom       | Type                                                 | Présence          | Rôle                                                                                                                                                                                                                                       |
| --------- | ---------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `type`    | `"reasoning" \| "retry" \| "text-delta" \| "result"` | Requis            | text-delta pour un fragment du texte de réponse, reasoning pour un raisonnement lisible, retry pour une reprise signalée par le fournisseur, result pour le résultat final. Les fournisseurs intégrés n’émettent que text-delta et result. |
| `text`    | `string`                                             | Selon la variante | Fragment du texte de réponse pour text-delta, ou raisonnement lisible pour reasoning, dans l’ordre d’arrivée. Le harness les relaie comme événements du même type.                                                                         |
| `attempt` | `number`                                             | Selon la variante | Numéro de tentative signalé par le fournisseur. Le harness le relaie comme événement model-retry et ne relance rien lui-même.                                                                                                              |
| `message` | `string \| undefined`                                | Selon la variante | Diagnostic de la reprise signalée, relayé dans l’événement model-retry.                                                                                                                                                                    |
| `result`  | `ModelResult`                                        | Selon la variante | Résultat final normalisé, identique à celui d’une requête sans streaming. Le harness en exige exactement un par stream.                                                                                                                    |

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
