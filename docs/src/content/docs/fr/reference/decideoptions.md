---
title: "DecideOptions"
description: "DecideOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DecideOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                          | Présence  | Rôle                                                                                                   |
| ---------------- | ----------------------------- | --------- | ------------------------------------------------------------------------------------------------------ |
| `provider`       | `DecisionProvider`            | Requis    | Provider de décision qui réalise cette évaluation.                                                     |
| `model`          | `string`                      | Requis    | Nom non vide du modèle de décision, sans réglages de génération ni de raisonnement.                    |
| `decision`       | `Decision<Q>`                 | Requis    | Déclaration typée et figée de questions créée avec defineDecision.                                     |
| `state`          | `DecisionState`               | Requis    | Texte, objet ou tableau validé comme JSON sans perte avant la requête.                                 |
| `signal`         | `AbortSignal \| undefined`    | Optionnel | Signal d’annulation facultatif de l’appelant transmis au provider de décision.                         |
| `observation`    | `ObservationHub \| undefined` | Optionnel | Hub d’observation avec scope facultatif ; l’état et les réponses détaillés exigent le mode verbose.    |
| `allowTruncated` | `boolean \| undefined`        | Optionnel | False par défaut ; true accepte une troncature signalée en conservant son indicateur dans le résultat. |

## Signature

```ts
export interface DecideOptions<
  Q extends DecisionQuestions = DecisionQuestions,
> {
  readonly provider: DecisionProvider;
  readonly model: string;
  readonly decision: Decision<Q>;
  readonly state: DecisionState;
  readonly signal?: AbortSignal;
  readonly observation?: ObservationHub;
  readonly allowTruncated?: boolean;
}
```

## Contrats associés

- [Decision](../decision/)
- [DecisionProvider](../decisionprovider/)
- [DecisionQuestions](../decisionquestions/)
- [DecisionState](../decisionstate/)
- [ObservationHub](../observationhub/)
