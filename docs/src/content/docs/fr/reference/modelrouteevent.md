---
title: "ModelRouteEvent"
description: "ModelRouteEvent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ModelRouteEvent } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                                          | Présence  | Rôle                                                                                                                                  |
| ------------ | --------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`       | `"model-route"`                               | Requis    | Discriminant model-route de l’événement de sélection.                                                                                 |
| `step`       | `number`                                      | Requis    | Étape du harness pour laquelle ce modèle effectif a été sélectionné.                                                                  |
| `choice`     | `string`                                      | Requis    | Clé effective de candidat après application des règles de repli de confiance et disponibilité.                                        |
| `model`      | `AgentModel`                                  | Requis    | Modèle normalisé sélectionné avec ses propres réglages de raisonnement et de sortie.                                                  |
| `reason`     | `"unavailable" \| "selected" \| "confidence"` | Requis    | Selected pour une confiance acceptée, confidence pour le repli de faible confiance, unavailable pour une erreur autorisée du routeur. |
| `confidence` | `number \| undefined`                         | Optionnel | Confiance native de décision, présente seulement lorsqu’une réponse choice valide a été reçue.                                        |

## Signature

```ts
export interface ModelRouteEvent {
  readonly kind: "model-route";
  readonly step: number;
  readonly choice: string;
  readonly model: AgentModel;
  readonly reason: "selected" | "confidence" | "unavailable";
  readonly confidence?: number;
}
```

## Contrats associés

- [AgentModel](../agentmodel/)
