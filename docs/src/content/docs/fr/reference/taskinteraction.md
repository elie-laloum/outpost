---
title: "TaskInteraction"
description: "TaskInteraction — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskInteraction } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                | Présence | Rôle                                                                                                              |
| ---------- | ------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `actors`   | `readonly string[]` | Requis   | Identifiants uniques d’acteurs de confiance autorisés à répondre à cette tâche.                                   |
| `identity` | `string`            | Requis   | Empreinte stable de configuration de l’interaction incluse dans les vérifications de compatibilité du checkpoint. |

## Signature

```ts
export interface TaskInteraction {
  readonly actors: readonly string[];
  readonly identity: string;
}
```
