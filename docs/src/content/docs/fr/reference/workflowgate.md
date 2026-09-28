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

| Nom              | Type                    | Présence  | Rôle                                                                                                                                                                  |
| ---------------- | ----------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authentication` | `"signed" \| undefined` | Optionnel | Exige des décisions signées avec signed ; omis, conserve la confiance dans l’acteur fourni par l’application. Cette exigence fait partie de l’identité du checkpoint. |
| `kind`           | `"approval" \| "pause"` | Requis    | approval attend approve ; pause attend resume. Les deux acceptent un rejet.                                                                                           |
| `prompt`         | `string`                | Requis    | Instruction expliquant la décision d’approbation ou de reprise demandée à l’acteur de confiance.                                                                      |
| `actors`         | `readonly string[]`     | Requis    | Liste non vide des acteurs autorisés à décider ce gate. Les gates signés exigent aussi une clé vérifiée associée à l’acteur choisi.                                   |

## Signature

```ts
export interface WorkflowGate {
  readonly authentication?: "signed";
  readonly kind: "approval" | "pause";
  readonly prompt: string;
  readonly actors: readonly string[];
}
```
