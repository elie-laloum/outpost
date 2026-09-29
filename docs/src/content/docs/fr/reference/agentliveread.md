---
title: "AgentLiveRead"
description: "AgentLiveRead — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentLiveRead } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                | Présence | Rôle                                                                                                                  |
| ---------- | ------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `consumed` | `number`            | Requis   | Nombre de messages utilisateur écrits, prompt compris, dont cette ligne de sortie confirme l’acceptation par l’agent. |
| `replies`  | `readonly string[]` | Requis   | Messages stdin complets à écrire en réponse à cette ligne de sortie, dans l’ordre.                                    |

## Signature

```ts
export interface AgentLiveRead {
  readonly consumed: number;
  readonly replies: readonly string[];
}
```
