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

| Nom              | Type                    | Présence  | Rôle                                                                                                                                                                                                                                                   |
| ---------------- | ----------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `authentication` | `"signed" \| undefined` | Optionnel | signed exige que chaque décision porte une preuve acceptée par le decisionVerifier ; omis, l’acteur nommé par votre application est cru. Fait partie de l’identité du checkpoint : l’ajouter ou le retirer rend un checkpoint sauvegardé incompatible. |
| `kind`           | `"approval" \| "pause"` | Requis    | approval attend approve ; pause attend resume. Les deux acceptent un rejet.                                                                                                                                                                            |
| `prompt`         | `string`                | Requis    | Question posée aux acteurs, copiée dans la demande en attente.                                                                                                                                                                                         |
| `actors`         | `readonly string[]`     | Requis    | Noms autorisés à décider cette gate. Une gate signée exige aussi une clé liée à l’acteur choisi.                                                                                                                                                       |

## Signature

```ts
export interface WorkflowGate {
  readonly authentication?: "signed";
  readonly kind: "approval" | "pause";
  readonly prompt: string;
  readonly actors: readonly string[];
}
```
