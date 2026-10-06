---
title: "decide"
description: "decide — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { decide } from "@elie-laloum/outpost";
```

## Rôle et comportement

Exécuter une requête de provider de décision sur un état JSON sans perte, valider toutes les réponses et renvoyer l’usage normalisé et les métadonnées natives. Les sommes des distributions et les scores pondérés acceptent l’arrondi cumulé à quatre décimales sans modifier les valeurs natives. Une troncature signalée échoue sauf autorisation explicite.

[Exemple complet et règles détaillées](../../guide/decisions/).

## Paramètres et propriétés

| Nom                      | Type                          | Présence  | Rôle                                                                                                   |
| ------------------------ | ----------------------------- | --------- | ------------------------------------------------------------------------------------------------------ |
| `options`                | `DecideOptions<Q>`            | Requis    | Provider, modèle nommé, déclaration et état JSON sans perte pour une évaluation immédiate.             |
| `options.provider`       | `DecisionProvider`            | Requis    | Provider de décision qui réalise cette évaluation.                                                     |
| `options.model`          | `string`                      | Requis    | Nom non vide du modèle de décision, sans réglages de génération ni de raisonnement.                    |
| `options.decision`       | `Decision<Q>`                 | Requis    | Déclaration typée et figée de questions créée avec defineDecision.                                     |
| `options.state`          | `DecisionState`               | Requis    | Texte, objet ou tableau validé comme JSON sans perte avant la requête.                                 |
| `options.signal`         | `AbortSignal \| undefined`    | Optionnel | Signal d’annulation facultatif de l’appelant transmis au provider de décision.                         |
| `options.observation`    | `ObservationHub \| undefined` | Optionnel | Hub d’observation avec scope facultatif ; l’état et les réponses détaillés exigent le mode verbose.    |
| `options.allowTruncated` | `boolean \| undefined`        | Optionnel | False par défaut ; true accepte une troncature signalée en conservant son indicateur dans le résultat. |

## Retour

`Promise<DecisionResult<Q>>`

## Signature

```ts
export declare function decide<const Q extends DecisionQuestions>(
  options: DecideOptions<Q>,
): Promise<DecisionResult<Q>>;
```

## Contrats associés

- [DecideOptions](../decideoptions/)
- [DecisionQuestions](../decisionquestions/)
- [DecisionResult](../decisionresult/)
