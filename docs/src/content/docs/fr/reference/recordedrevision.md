---
title: "RecordedRevision"
description: "RecordedRevision — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecordedRevision } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type     | Présence | Rôle                                                                      |
| -------- | -------- | -------- | ------------------------------------------------------------------------- |
| `commit` | `string` | Requis   | Commit de départ du dispatch.                                             |
| `tree`   | `string` | Requis   | Arbre de ce commit ; le rejeu le compare à l’arbre du HEAD de la sandbox. |

## Signature

```ts
export interface RecordedRevision {
  readonly commit: string;
  readonly tree: string;
}
```
