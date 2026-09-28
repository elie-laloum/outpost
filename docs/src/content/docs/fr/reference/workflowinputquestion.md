---
title: "WorkflowInputQuestion"
description: "WorkflowInputQuestion — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowInputQuestion } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                             | Présence  | Rôle                                                                        |
| --------------- | -------------------------------- | --------- | --------------------------------------------------------------------------- |
| `question`      | `string`                         | Requis    | Question lisible et non vide à afficher au répondant.                       |
| `choices`       | `readonly string[] \| undefined` | Optionnel | Liste optionnelle non vide de choix de réponse uniques.                     |
| `allowFreeText` | `boolean \| undefined`           | Optionnel | Autorise les réponses hors des choix ; true si omis. false exige des choix. |

## Signature

```ts
export interface WorkflowInputQuestion {
  readonly question: string;
  readonly choices?: readonly string[];
  readonly allowFreeText?: boolean;
}
```
