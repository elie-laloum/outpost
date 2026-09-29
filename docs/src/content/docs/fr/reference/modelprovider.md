---
title: "ModelProvider"
description: "ModelProvider — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ModelProvider } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                                                        | Présence  | Rôle                                                                                                                                                                                                                                                                         |
| ---------- | --------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`     | `string`                                                                    | Requis    | Nom du fournisseur : openai ou anthropic pour les fournisseurs intégrés.                                                                                                                                                                                                     |
| `identity` | `string \| undefined`                                                       | Optionnel | Clé stable formée du nom du fournisseur, du chemin du protocole et de l’URL de base, par exemple openai:responses:https://api.openai.com/v1. Les fournisseurs intégrés l’inscrivent sur les blocs de raisonnement et ne les rejouent qu’à la même identité.                  |
| `validate` | `((model: AgentModel) => void) \| undefined`                                | Optionnel | Contrôle appelé par createAgent() avec le modèle d’agent normalisé ; levez une erreur pour refuser des réglages non pris en charge avant toute requête. Le fournisseur Anthropic exige maxOutputTokens et refuse reasoning minimal ; le fournisseur OpenAI n’en définit pas. |
| `request`  | `(request: ModelRequest) => Promise<ModelResult>`                           | Requis    | Envoie une requête et se résout avec son résultat normalisé. Dans un harness, la requête reçoit le reasoning et le maxOutputTokens du modèle de l’agent ainsi que le signal d’annulation de l’exécution, et l’usage rapporté est comptabilisé une fois.                      |
| `stream`   | `((request: ModelRequest) => AsyncIterable<ModelStreamEvent>) \| undefined` | Optionnel | Variante de request en streaming : produit des événements text-delta au fil de la réponse, puis un événement result. Le harness l’utilise à la place de request quand elle est présente.                                                                                     |

## Signature

```ts
export interface ModelProvider {
  readonly name: string;
  readonly identity?: string;
  validate?(model: AgentModel): void;
  request(request: ModelRequest): Promise<ModelResult>;
  stream?(request: ModelRequest): AsyncIterable<ModelStreamEvent>;
}
```

## Contrats associés

- [AgentModel](../agentmodel/)
- [ModelRequest](../modelrequest/)
- [ModelResult](../modelresult/)
- [ModelStreamEvent](../modelstreamevent/)
