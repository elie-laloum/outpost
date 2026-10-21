---
title: "TaskResultSelection"
description: "TaskResultSelection — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom      | Type                                            | Présence | Rôle                                                                                                                                                                                                                               |
| -------- | ----------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `select` | `(result: Result) => Output \| Promise<Output>` | Requis   | Projette le résultat du dispatch terminé après comptabilisation de sa consommation. Renvoyez du JSON sans perte pour un workflow avec checkpoints. Cette option n’active pas le cache et ne change pas la propriété de la sandbox. |

## Signature

```ts
export interface TaskResultSelection<Result, Output> {
  select(result: Result): Output | Promise<Output>;
}
```
