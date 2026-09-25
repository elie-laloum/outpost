---
title: "WorkflowGate"
description: "WorkflowGate — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowGate } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type                    | Présence | Rôle                                                                                                                        |
| -------- | ----------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| `kind`   | `"approval" \| "pause"` | Requis   | approval attend approve ; pause attend resume. Les deux acceptent un rejet.                                                 |
| `prompt` | `string`                | Requis   | Instruction expliquant la décision d’approbation ou de reprise demandée à l’acteur de confiance.                            |
| `actors` | `readonly string[]`     | Requis   | Liste non vide des noms d’acteurs de confiance autorisés à décider cette gate ; leur authentification relève de l’appelant. |

## Signature

```ts
export interface WorkflowGate {
  readonly kind: "approval" | "pause";
  readonly prompt: string;
  readonly actors: readonly string[];
}
```
