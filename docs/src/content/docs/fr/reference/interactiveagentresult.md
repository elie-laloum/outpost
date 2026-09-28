---
title: "InteractiveAgentResult"
description: "InteractiveAgentResult — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { InteractiveAgentResult } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom            | Type           | Présence | Rôle                                                                                                         |
| -------------- | -------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| `output`       | `WorkflowJson` | Requis   | Sortie JSON sans perte du dialogue terminé.                                                                  |
| `conversation` | `string`       | Requis   | Identifiant de conversation capturée du dernier tour.                                                        |
| `branch`       | `string`       | Requis   | Branche de travail nommée conservée ; aucune intégration ni aucun push automatique.                          |
| `directory`    | `string`       | Requis   | Répertoire du worktree conservé contenant les fichiers du projet, y compris les modifications non commitées. |
| `turns`        | `number`       | Requis   | Nombre de tours de dialogue terminés ; les demandes de réparation restent dans leur tour.                    |

## Signature

```ts
export type InteractiveAgentResult = {
  readonly output: WorkflowJson;
  readonly conversation: string;
  readonly branch: string;
  readonly directory: string;
  readonly turns: number;
};
```

## Contrats associés

- [WorkflowJson](../workflowjson/)
