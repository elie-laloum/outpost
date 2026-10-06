---
title: "DecisionResult"
description: "DecisionResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DecisionResult } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                        | Présence  | Rôle                                                                                                     |
| ----------- | --------------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| `provider`  | `string`                    | Requis    | Nom du provider de décision ayant exécuté la requête.                                                    |
| `model`     | `string`                    | Requis    | Nom non vide du modèle réellement signalé par la réponse du provider.                                    |
| `answers`   | `DecisionAnswers<Q>`        | Requis    | Réponses validées dont les clés et choix littéraux sont inférés depuis les questions de décision.        |
| `usage`     | `Usage`                     | Requis    | Usage normalisé compté une fois par la tâche ou le harness routé ; un reçu absent fixe complete à false. |
| `truncated` | `boolean \| undefined`      | Optionnel | Troncature d’entrée signalée ; son absence ne prouve pas que l’entrée entière a été évaluée.             |
| `metadata`  | `WorkflowJson \| undefined` | Optionnel | Extensions JSON sans perte facultatives ; l’adapter System One conserve ici la réponse native complète.  |

## Signature

```ts
export interface DecisionResult<
  Q extends DecisionQuestions = DecisionQuestions,
> {
  readonly provider: string;
  readonly model: string;
  readonly answers: DecisionAnswers<Q>;
  readonly usage: Usage;
  readonly truncated?: boolean;
  readonly metadata?: WorkflowJson;
}
```

## Contrats associés

- [DecisionAnswers](../decisionanswers/)
- [DecisionQuestions](../decisionquestions/)
- [Usage](../usage/)
- [WorkflowJson](../workflowjson/)
