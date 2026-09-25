---
title: "Commit"
description: "Commit — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Commit } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type     | Présence | Rôle                                     |
| --------- | -------- | -------- | ---------------------------------------- |
| `oid`     | `string` | Requis   | Identifiant d’objet du commit Git.       |
| `subject` | `string` | Requis   | Première ligne du message de commit Git. |

## Signature

```ts
export interface Commit {
  readonly oid: string;
  readonly subject: string;
}
```
