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

| Nom              | Type                    | Présence  | Rôle                                                                                                    |
| ---------------- | ----------------------- | --------- | ------------------------------------------------------------------------------------------------------- |
| `id`             | `string`                | Requis    | Identifiant aléatoire généré quand la gate se suspend ; le requestId d’une décision doit lui être égal. |
| `requestedAt`    | `string`                | Requis    | Horodatage ISO de l’entrée de la gate en pause.                                                         |
| `authentication` | `"signed" \| undefined` | Optionnel | Exigence de signature copiée du gate dans cette demande en attente.                                     |
| `kind`           | `"approval" \| "pause"` | Requis    | approval attend approve ; pause attend resume. Les deux acceptent un rejet.                             |
| `prompt`         | `string`                | Requis    | Question posée aux acteurs, copiée dans la demande en attente.                                          |
| `actors`         | `readonly string[]`     | Requis    | Noms autorisés à décider cette gate. Une gate signée exige aussi une clé liée à l’acteur choisi.        |

## Signature

```ts
export interface WorkflowPauseRequest extends WorkflowGate {
  readonly id: string;
  readonly requestedAt: string;
}
```

## Contrats associés

- [WorkflowGate](../workflowgate/)
