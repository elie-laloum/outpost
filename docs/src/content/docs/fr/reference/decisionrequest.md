---
title: "DecisionRequest"
description: "DecisionRequest — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DecisionRequest } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                         | Présence  | Rôle                                                                                |
| ----------- | -------------------------------------------- | --------- | ----------------------------------------------------------------------------------- |
| `model`     | `string`                                     | Requis    | Nom non vide du modèle de décision, sans réglages de génération ni de raisonnement. |
| `questions` | `Readonly<Record<string, DecisionQuestion>>` | Requis    | Questions nommées validées et immuables envoyées dans la requête du provider.       |
| `state`     | `DecisionState`                              | Requis    | Texte, objet ou tableau validé comme JSON sans perte avant la requête.              |
| `signal`    | `AbortSignal \| undefined`                   | Optionnel | Signal d’annulation facultatif de l’appelant transmis au provider de décision.      |

## Signature

```ts
export interface DecisionRequest {
  readonly model: string;
  readonly questions: DecisionQuestions;
  readonly state: DecisionState;
  readonly signal?: AbortSignal;
}
```

## Contrats associés

- [DecisionQuestions](../decisionquestions/)
- [DecisionState](../decisionstate/)
