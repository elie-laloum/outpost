---
title: "ModelReasoningBlock"
description: "ModelReasoningBlock — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : messages, appels d’outils et raisonnement rejouable neutres vis-à-vis du fournisseur. Pas encore de streaming ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { ModelReasoningBlock } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type          | Présence | Rôle                                                                                                                                           |
| ---------- | ------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`     | `"reasoning"` | Requis   | Discriminant du bloc : reasoning.                                                                                                              |
| `provider` | `string`      | Requis   | Identité du fournisseur qui a produit le bloc ; les autres fournisseurs ne le reçoivent jamais.                                                |
| `model`    | `string`      | Requis   | Modèle qui a produit le bloc ; il n’est rejoué qu’à ce même modèle.                                                                            |
| `data`     | `unknown`     | Requis   | Charge opaque du service, comme un bloc thinking Anthropic avec sa signature ou un élément de raisonnement chiffré OpenAI. Ne la modifiez pas. |

## Signature

```ts
export interface ModelReasoningBlock {
  readonly type: "reasoning";
  readonly provider: string;
  readonly model: string;
  readonly data: unknown;
}
```
