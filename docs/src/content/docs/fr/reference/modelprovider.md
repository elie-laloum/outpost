---
title: "ModelProvider"
description: "ModelProvider — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : contrat de fournisseur pour les harness personnalisés, avec messages, appels d’outils, raisonnement rejouable, cache d’historique et streaming. Il peut changer avant publication.
:::

## Import

```ts
import type { ModelProvider } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                                                        | Présence  | Rôle                                                                                                                                                                                                                              |
| ---------- | --------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`     | `string`                                                                    | Requis    | Identité du fournisseur ; le client direct intégré indique openai-compatible.                                                                                                                                                     |
| `identity` | `string \| undefined`                                                       | Optionnel | Clé stable qui combine le protocole et l’endpoint. Les blocs de raisonnement la portent pour n’être rejoués qu’au service qui les a produits.                                                                                     |
| `validate` | `((model: AgentModel) => void) \| undefined`                                | Optionnel | Contrôle optionnel appelé par agent() avec l’AgentModel normalisé ; lever une erreur pour refuser un niveau de raisonnement non pris en charge ou une limite de sortie absente avant toute requête.                               |
| `request`  | `(request: ModelRequest) => Promise<ModelResult>`                           | Requis    | Exécute une requête bornée sans streaming pour le modèle fourni. Le wrapper du harness propage l’annulation et comptabilise une fois l’usage rapporté.                                                                            |
| `stream`   | `((request: ModelRequest) => AsyncIterable<ModelStreamEvent>) \| undefined` | Optionnel | Variante optionnelle de request en streaming : produit des événements text-delta au fil de la réponse, puis un événement result avec le même ModelResult. Les harness personnalisés l’utilisent automatiquement s’il est présent. |

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
