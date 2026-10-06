---
title: "defineDecision"
description: "defineDecision — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineDecision } from "@elie-laloum/outpost";
```

## Rôle et comportement

Valider, copier et figer des questions nommées choice, score et noul. Aucune requête n’est exécutée ; les clés et choix littéraux déterminent les types inférés des réponses.

[Exemple complet et règles détaillées](../../guide/decisions/).

## Paramètres et propriétés

| Nom                 | Type                 | Présence | Rôle                                                                                            |
| ------------------- | -------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `options`           | `DecisionOptions<Q>` | Requis   | Questions à valider, copier et figer sans exécuter de requête.                                  |
| `options.questions` | `Q`                  | Requis   | Questions nommées non vides dont les clés et choix littéraux déterminent les types de réponses. |

## Retour

`Decision<Q>`

## Signature

```ts
export declare function defineDecision<const Q extends DecisionQuestions>(
  options: DecisionOptions<Q>,
): Decision<Q>;
```

## Contrats associés

- [Decision](../decision/)
- [DecisionOptions](../decisionoptions/)
- [DecisionQuestions](../decisionquestions/)
