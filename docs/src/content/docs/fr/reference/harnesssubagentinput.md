---
title: "HarnessSubagentInput"
description: "HarnessSubagentInput — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessSubagentInput } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type     | Présence | Rôle                                                                                                                        |
| -------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| `prompt` | `string` | Requis   | Texte non vide de la tâche fourni par le modèle parent. L’historique du parent n’est pas copié dans la conversation enfant. |

## Signature

```ts
export interface HarnessSubagentInput {
  readonly prompt: string;
}
```
