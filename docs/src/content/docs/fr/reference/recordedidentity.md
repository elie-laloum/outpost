---
title: "RecordedIdentity"
description: "RecordedIdentity — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecordedIdentity } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom     | Type     | Présence | Rôle                                                  |
| ------- | -------- | -------- | ----------------------------------------------------- |
| `name`  | `string` | Requis   | Nom de l’identité Git.                                |
| `email` | `string` | Requis   | E-mail de l’identité Git.                             |
| `date`  | `string` | Requis   | Date interne Git : secondes Unix et décalage horaire. |

## Signature

```ts
export interface RecordedIdentity {
  readonly name: string;
  readonly email: string;
  readonly date: string;
}
```
