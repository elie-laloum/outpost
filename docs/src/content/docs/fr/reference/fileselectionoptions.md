---
title: "FileSelectionOptions"
description: "FileSelectionOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileSelectionOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                 | Présence  | Rôle                                                                                                                           |
| ----------- | ------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `selection` | `"git" \| "filesystem" \| undefined` | Optionnel | git par défaut pour les appels legacy ; filesystem effectue un parcours borné dans la sandbox sans Git ni filtrage .gitignore. |

## Signature

```ts
export interface FileSelectionOptions {
  readonly selection?: "git" | "filesystem";
}
```
