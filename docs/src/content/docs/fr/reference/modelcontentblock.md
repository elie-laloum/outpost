---
title: "ModelContentBlock"
description: "ModelContentBlock — Outpost API"
sidebar:
  order: 10
---

:::caution[Expérimental]
Expérimental : contrat de fournisseur pour les harness personnalisés, avec messages, appels d’outils, raisonnement rejouable, cache d’historique et streaming. Il peut changer avant publication.
:::

## Import

```ts
import type { ModelContentBlock } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom        | Type                                                    | Présence          | Rôle                                                                                                                                                    |
| ---------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`     | `"text" \| "tool-call" \| "tool-result" \| "reasoning"` | Requis            | Discriminant du bloc : text.                                                                                                                            |
| `text`     | `string`                                                | Selon la variante | Texte brut du bloc ; les blocs de texte vides ne sont pas envoyés à Anthropic.                                                                          |
| `id`       | `string`                                                | Selon la variante | Identifiant d’appel émis par le service, que le résultat correspondant doit référencer.                                                                 |
| `name`     | `string`                                                | Selon la variante | Nom de l’outil demandé, tel que déclaré dans les outils de la requête.                                                                                  |
| `input`    | `unknown`                                               | Selon la variante | Arguments de l’outil analysés. Quand le service renvoie un JSON invalide, la chaîne brute est conservée pour que l’appelant signale l’erreur au modèle. |
| `callId`   | `string`                                                | Selon la variante | Identifiant de l’appel d’outil auquel ce résultat répond.                                                                                               |
| `content`  | `string`                                                | Selon la variante | Texte renvoyé au modèle pour cet appel.                                                                                                                 |
| `isError`  | `boolean \| undefined`                                  | Selon la variante | Signale un échec d’exécution de l’outil pour que le modèle puisse se corriger.                                                                          |
| `provider` | `string`                                                | Selon la variante | Identité du fournisseur qui a produit le bloc ; les autres fournisseurs ne le reçoivent jamais.                                                         |
| `model`    | `string`                                                | Selon la variante | Modèle qui a produit le bloc ; il n’est rejoué qu’à ce même modèle.                                                                                     |
| `data`     | `unknown`                                               | Selon la variante | Charge opaque du service, comme un bloc thinking Anthropic avec sa signature ou un élément de raisonnement chiffré OpenAI. Ne la modifiez pas.          |

## Signature

```ts
export type ModelContentBlock =
  | ModelTextBlock
  | ModelToolCallBlock
  | ModelToolResultBlock
  | ModelReasoningBlock;
```

## Contrats associés

- [ModelReasoningBlock](../modelreasoningblock/)
- [ModelTextBlock](../modeltextblock/)
- [ModelToolCallBlock](../modeltoolcallblock/)
- [ModelToolResultBlock](../modeltoolresultblock/)
