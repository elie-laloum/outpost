---
title: "ModelStreamEvent"
description: "ModelStreamEvent — Outpost API"
sidebar:
  order: 10
---

:::caution[Expérimental]
Expérimental : contrat de fournisseur pour les harness personnalisés, avec messages, appels d’outils, raisonnement rejouable, cache d’historique et streaming. Il peut changer dans une version ultérieure.
:::

## Import

```ts
import type { ModelStreamEvent } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom      | Type                       | Présence          | Rôle                                                                               |
| -------- | -------------------------- | ----------------- | ---------------------------------------------------------------------------------- |
| `type`   | `"text-delta" \| "result"` | Requis            | text-delta pour un fragment du texte de réponse, ou result pour le résultat final. |
| `text`   | `string`                   | Selon la variante | Fragment du texte de réponse, dans l’ordre d’arrivée.                              |
| `result` | `ModelResult`              | Selon la variante | Résultat final normalisé, identique à celui d’une requête sans streaming.          |

## Signature

```ts
export type ModelStreamEvent =
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
