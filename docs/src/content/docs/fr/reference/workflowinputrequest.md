---
title: "WorkflowInputRequest"
description: "WorkflowInputRequest — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowInputRequest } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                             | Présence  | Rôle                                                                              |
| --------------- | -------------------------------- | --------- | --------------------------------------------------------------------------------- |
| `id`            | `string`                         | Requis    | Identifiant unique de cette question persistée, requis pour soumettre sa réponse. |
| `executionId`   | `string`                         | Requis    | Exécution de workflow propriétaire de cette demande en attente.                   |
| `key`           | `string`                         | Requis    | Clé de la tâche suspendue sur cette demande.                                      |
| `requestedAt`   | `string`                         | Requis    | Horodatage ISO de création de la question.                                        |
| `question`      | `string`                         | Requis    | Question lisible et non vide à afficher au répondant.                             |
| `choices`       | `readonly string[] \| undefined` | Optionnel | Liste non vide de choix de réponse uniques.                                       |
| `allowFreeText` | `boolean \| undefined`           | Optionnel | Autorise les réponses hors des choix ; true si omis. false exige des choix.       |

## Signature

```ts
export interface WorkflowInputRequest extends WorkflowInputQuestion {
  readonly id: string;
  readonly executionId: string;
  readonly key: string;
  readonly requestedAt: string;
}
```

## Contrats associés

- [WorkflowInputQuestion](../workflowinputquestion/)
