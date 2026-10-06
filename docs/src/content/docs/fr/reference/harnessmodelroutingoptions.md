---
title: "HarnessModelRoutingOptions"
description: "HarnessModelRoutingOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessModelRoutingOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                                                                                                               | Présence  | Rôle                                                                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `provider`      | `DecisionProvider`                                                                                                 | Requis    | Provider de décision indépendant utilisé une fois par étape du harness après compaction.                                                                                |
| `model`         | `string`                                                                                                           | Requis    | Modèle nommé du routeur, indépendant des modèles conversationnels candidats.                                                                                            |
| `decision`      | `Decision<Q>`                                                                                                      | Requis    | Déclaration figée de questions contenant la question choice sélectionnée.                                                                                               |
| `question`      | `Key`                                                                                                              | Requis    | Clé explicite de question choice dont les critères correspondent exactement aux clés des modèles candidats.                                                             |
| `models`        | `Readonly<Record<\`${Extract<keyof Extract<Q[Key], ChoiceQuestion>["criteria"], string \| number>}\`, ModelSpec>>` | Requis    | Un candidat par choix déclaré ; tous utilisent le provider de modèles du harness et ont leurs propres réglages.                                                         |
| `minConfidence` | `number \| undefined`                                                                                              | Optionnel | Seuil de confiance dans [0,1] ; une confiance inférieure sélectionne le repli. Valeur par défaut à la déclaration : 0.85.                                               |
| `fallback`      | `\`${Extract<keyof Extract<Q[Key], ChoiceQuestion>["criteria"], string \| number>}\``                              | Requis    | Clé de candidat déclaré utilisée en cas de faible confiance ou d’erreur autorisée du routeur.                                                                           |
| `onError`       | `"fallback" \| "fail" \| undefined`                                                                                | Optionnel | Fallback par défaut seulement pour timeout ou indisponibilité classée ; fail propage ces erreurs. Les autres erreurs se propagent toujours.                             |
| `state`         | `((context: HarnessModelRoutingContext) => DecisionState \| Promise<DecisionState>) \| undefined`                  | Optionnel | Fonction d’état synchrone/asynchrone facultative ; l’état par défaut contient instructions, historique visible, outils, étape et modèle actif sans raisonnement opaque. |

## Signature

```ts
export interface HarnessModelRoutingOptions<
  Q extends DecisionQuestions = DecisionQuestions,
  Key extends RoutingQuestion<Q> = RoutingQuestion<Q>,
> {
  readonly provider: DecisionProvider;
  readonly model: string;
  readonly decision: Decision<Q>;
  readonly question: Key;
  readonly models: Readonly<Record<RoutingChoices<Q, Key>, ModelSpec>>;
  readonly minConfidence?: number;
  readonly fallback: RoutingChoices<Q, Key>;
  readonly onError?: "fallback" | "fail";
  readonly state?: (
    context: HarnessModelRoutingContext,
  ) => DecisionState | Promise<DecisionState>;
}
```

## Contrats associés

- [Decision](../decision/)
- [DecisionProvider](../decisionprovider/)
- [DecisionQuestions](../decisionquestions/)
- [DecisionState](../decisionstate/)
- [HarnessModelRoutingContext](../harnessmodelroutingcontext/)
- [ModelSpec](../modelspec/)
- [RoutingChoices](../routingchoices/)
- [RoutingQuestion](../routingquestion/)
