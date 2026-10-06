---
title: "defineHarnessModelRouting"
description: "defineHarnessModelRouting — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineHarnessModelRouting } from "@elie-laloum/outpost";
```

## Rôle et comportement

Valider et figer une déclaration de routage de choix vers modèles. Les clés exactes des candidats et un repli déclaré sont requis ; le harness intégré valide les candidats avec son provider de modèles avant allocation.

[Exemple complet et règles détaillées](../../guide/decisions/).

## Paramètres et propriétés

| Nom                     | Type                                                                                                               | Présence  | Rôle                                                                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`               | `HarnessModelRoutingOptions<Q, Key>`                                                                               | Requis    | Question de choix, mapping exact des candidats, politique de repli et fonction d’état facultative.                                                                      |
| `options.provider`      | `DecisionProvider`                                                                                                 | Requis    | Provider de décision indépendant utilisé une fois par étape du harness après compaction.                                                                                |
| `options.model`         | `string`                                                                                                           | Requis    | Modèle nommé du routeur, indépendant des modèles conversationnels candidats.                                                                                            |
| `options.decision`      | `Decision<Q>`                                                                                                      | Requis    | Déclaration figée de questions contenant la question choice sélectionnée.                                                                                               |
| `options.question`      | `Key`                                                                                                              | Requis    | Clé explicite de question choice dont les critères correspondent exactement aux clés des modèles candidats.                                                             |
| `options.models`        | `Readonly<Record<\`${Extract<keyof Extract<Q[Key], ChoiceQuestion>["criteria"], string \| number>}\`, ModelSpec>>` | Requis    | Un candidat par choix déclaré ; tous utilisent le provider de modèles du harness et ont leurs propres réglages.                                                         |
| `options.minConfidence` | `number \| undefined`                                                                                              | Optionnel | Seuil de confiance dans [0,1] ; une confiance inférieure sélectionne le repli. Valeur par défaut à la déclaration : 0.85.                                               |
| `options.fallback`      | `\`${Extract<keyof Extract<Q[Key], ChoiceQuestion>["criteria"], string \| number>}\``                              | Requis    | Clé de candidat déclaré utilisée en cas de faible confiance ou d’erreur autorisée du routeur.                                                                           |
| `options.onError`       | `"fallback" \| "fail" \| undefined`                                                                                | Optionnel | Fallback par défaut seulement pour timeout ou indisponibilité classée ; fail propage ces erreurs. Les autres erreurs se propagent toujours.                             |
| `options.state`         | `((context: HarnessModelRoutingContext) => DecisionState \| Promise<DecisionState>) \| undefined`                  | Optionnel | Fonction d’état synchrone/asynchrone facultative ; l’état par défaut contient instructions, historique visible, outils, étape et modèle actif sans raisonnement opaque. |

## Retour

`HarnessModelRouting`

## Signature

```ts
export declare function defineHarnessModelRouting<
  const Q extends DecisionQuestions,
  const Key extends RoutingQuestion<Q>,
>(options: HarnessModelRoutingOptions<Q, Key>): HarnessModelRouting;
```

## Contrats associés

- [DecisionQuestions](../decisionquestions/)
- [HarnessModelRouting](../harnessmodelrouting/)
- [HarnessModelRoutingOptions](../harnessmodelroutingoptions/)
- [RoutingQuestion](../routingquestion/)
