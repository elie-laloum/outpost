---
title: "WorkflowGateOptions"
description: "WorkflowGateOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowGateOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                                    | Présence  | Rôle                                                                                                                                                                       |
| ---------------- | --------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authentication` | `"signed" \| undefined`                 | Optionnel | signed exige une preuve Ed25519 vérifiée sur chaque décision de cette gate. Enregistré dans la gate et dans l’identité du checkpoint.                                      |
| `key`            | `string`                                | Requis    | Clé de tâche de la gate, unique dans le workflow et reprise par chaque décision. Lettres, chiffres, point, tiret bas et tiret, en commençant par une lettre ou un chiffre. |
| `after`          | `readonly Task<unknown>[] \| undefined` | Optionnel | Tâches qui doivent être terminées avant que la gate se suspende. Si l’une échoue ou est ignorée, annulée ou rejetée, la gate est ignorée.                                  |
| `prompt`         | `string`                                | Requis    | Question posée aux acteurs, copiée dans la demande en attente. Un prompt vide lève une erreur.                                                                             |
| `actors`         | `readonly string[]`                     | Requis    | Noms autorisés à décider la gate : au moins un, uniques et non vides. Outpost fait confiance à l’acteur soumis par votre application, sauf si la gate est signée.          |

## Signature

```ts
export interface WorkflowGateOptions {
  readonly authentication?: "signed";
  readonly key: string;
  readonly after?: readonly Task[];
  readonly prompt: string;
  readonly actors: readonly string[];
}
```

## Contrats associés

- [Task](../type-task/)
