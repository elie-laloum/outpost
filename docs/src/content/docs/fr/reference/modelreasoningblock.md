---
title: "ModelReasoningBlock"
description: "ModelReasoningBlock — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ModelReasoningBlock } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                  | Présence  | Rôle                                                                                                                                                                       |
| ---------- | --------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`     | `string \| undefined` | Optionnel | Raisonnement lisible exposé par le service : le texte thinking d’Anthropic ou le résumé de Responses. Le harness l’émet comme événement reasoning ; le rejeu utilise data. |
| `type`     | `"reasoning"`         | Requis    | Discriminant du bloc : reasoning.                                                                                                                                          |
| `provider` | `string`              | Requis    | Identité du fournisseur qui a produit le bloc ; les autres fournisseurs ne le reçoivent jamais.                                                                            |
| `model`    | `string`              | Requis    | Modèle qui a produit le bloc ; il n’est rejoué qu’à ce même modèle.                                                                                                        |
| `data`     | `unknown`             | Requis    | Charge opaque du service : un bloc thinking ou redacted_thinking Anthropic avec sa signature, ou un élément reasoning d’OpenAI Responses. Rejouez-la sans la modifier.     |

## Signature

```ts
export interface ModelReasoningBlock {
  readonly text?: string;
  readonly type: "reasoning";
  readonly provider: string;
  readonly model: string;
  readonly data: unknown;
}
```
