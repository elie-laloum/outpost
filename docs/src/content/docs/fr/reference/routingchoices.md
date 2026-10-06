---
title: "RoutingChoices"
description: "RoutingChoices — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { RoutingChoices } from "@elie-laloum/outpost";
```

## Rôle et comportement

Valeurs littérales des critères de la question choice sélectionnée, utilisées comme clés de candidats et de repli.

[Exemple complet et règles détaillées](../../guide/decisions/).

## Signature

```ts
export type RoutingChoices<
  Q extends DecisionQuestions,
  Key extends RoutingQuestion<Q>,
> = `${Extract<keyof Extract<Q[Key], ChoiceQuestion>["criteria"], string | number>}`;
```

## Contrats associés

- [ChoiceQuestion](../choicequestion/)
- [DecisionQuestions](../decisionquestions/)
- [RoutingQuestion](../routingquestion/)
