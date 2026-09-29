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

| Nom                 | Type                  | Présence  | Rôle                                                                                                                                                                                                                            |
| ------------------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `retainedDirectory` | `string \| undefined` | Optionnel | Worktree conservé à la fermeture : renseigné quand preserve a été demandé, ou quand il a un HEAD détaché ou des fichiers modifiés, non suivis ou ignorés. Absent quand le worktree a été supprimé, et toujours en mode current. |

## Signature

```ts
export interface Disposal {
  readonly retainedDirectory?: string;
}
```
