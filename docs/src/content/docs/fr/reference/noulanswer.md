---
title: "NoulAnswer"
description: "NoulAnswer — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { NoulAnswer } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom    | Type     | Présence | Rôle                                                        |
| ------ | -------- | -------- | ----------------------------------------------------------- |
| `type` | `"noul"` | Requis   | Discriminant de réponse noul.                               |
| `noul` | `number` | Requis   | Probabilité native finie du oui, comprise entre zéro et un. |

## Signature

```ts
export interface NoulAnswer {
  readonly type: "noul";
  readonly noul: number;
}
```
