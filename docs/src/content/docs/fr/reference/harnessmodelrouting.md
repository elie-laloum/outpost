---
title: "HarnessModelRouting"
description: "HarnessModelRouting — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessModelRouting } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                                                                                              | Présence  | Rôle                                                                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`          | `"model-routing"`                                                                                 | Requis    | Discriminant model-routing de déclaration validée de routage.                                                                                                           |
| `provider`      | `DecisionProvider`                                                                                | Requis    | Provider de décision indépendant utilisé une fois par étape du harness après compaction.                                                                                |
| `model`         | `string`                                                                                          | Requis    | Modèle nommé du routeur, indépendant des modèles conversationnels candidats.                                                                                            |
| `decision`      | `Decision<Readonly<Record<string, DecisionQuestion>>>`                                            | Requis    | Déclaration figée de questions contenant la question choice sélectionnée.                                                                                               |
| `question`      | `string`                                                                                          | Requis    | Clé explicite de question choice dont les critères correspondent exactement aux clés des modèles candidats.                                                             |
| `models`        | `Readonly<Record<string, AgentModel>>`                                                            | Requis    | Un candidat par choix déclaré ; tous utilisent le provider de modèles du harness et ont leurs propres réglages.                                                         |
| `minConfidence` | `number`                                                                                          | Requis    | Seuil de confiance dans [0,1] ; une confiance inférieure sélectionne le repli. Valeur par défaut à la déclaration : 0.85.                                               |
| `fallback`      | `string`                                                                                          | Requis    | Clé de candidat déclaré utilisée en cas de faible confiance ou d’erreur autorisée du routeur.                                                                           |
| `onError`       | `"fallback" \| "fail"`                                                                            | Requis    | Fallback par défaut seulement pour timeout ou indisponibilité classée ; fail propage ces erreurs. Les autres erreurs se propagent toujours.                             |
| `state`         | `((context: HarnessModelRoutingContext) => DecisionState \| Promise<DecisionState>) \| undefined` | Optionnel | Fonction d’état synchrone/asynchrone facultative ; l’état par défaut contient instructions, historique visible, outils, étape et modèle actif sans raisonnement opaque. |

## Signature

```ts
export interface HarnessModelRouting {
  readonly kind: "model-routing";
  readonly provider: DecisionProvider;
  readonly model: string;
  readonly decision: Decision;
  readonly question: string;
  readonly models: Readonly<Record<string, AgentModel>>;
  readonly minConfidence: number;
  readonly fallback: string;
  readonly onError: "fallback" | "fail";
  readonly state?: (
    context: HarnessModelRoutingContext,
  ) => DecisionState | Promise<DecisionState>;
}
```

## Contrats associés

- [AgentModel](../agentmodel/)
- [Decision](../decision/)
- [DecisionProvider](../decisionprovider/)
- [DecisionState](../decisionstate/)
- [HarnessModelRoutingContext](../harnessmodelroutingcontext/)
