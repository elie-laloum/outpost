---
title: "WorkflowPauseRequest"
description: "WorkflowPauseRequest — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowPauseRequest } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                    | Présence | Rôle                                                                                                                        |
| ------------- | ----------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| `id`          | `string`                | Requis   | Identifiant unique de cette demande de gate en attente ; les décisions doivent lui correspondre.                            |
| `requestedAt` | `string`                | Requis   | Horodatage ISO de l’entrée de la gate en pause.                                                                             |
| `kind`        | `"approval" \| "pause"` | Requis   | approval attend approve ; pause attend resume. Les deux acceptent un rejet.                                                 |
| `prompt`      | `string`                | Requis   | Instruction expliquant la décision d’approbation ou de reprise demandée à l’acteur de confiance.                            |
| `actors`      | `readonly string[]`     | Requis   | Liste non vide des noms d’acteurs de confiance autorisés à décider cette gate ; leur authentification relève de l’appelant. |

## Signature

```ts
export interface WorkflowPauseRequest extends WorkflowGate {
  readonly id: string;
  readonly requestedAt: string;
}
```

## Contrats associés

- [WorkflowGate](../workflowgate/)
