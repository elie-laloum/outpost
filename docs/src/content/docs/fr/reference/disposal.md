---
title: "Disposal"
description: "Disposal — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Disposal } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                 | Type                  | Présence  | Rôle                                                |
| ------------------- | --------------------- | --------- | --------------------------------------------------- |
| `retainedDirectory` | `string \| undefined` | Optionnel | Workspace conservé pour inspection ou récupération. |

## Signature

```ts
export interface Disposal {
  readonly retainedDirectory?: string;
}
```
