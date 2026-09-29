---
title: "ShellToolsOptions"
description: "ShellToolsOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ShellToolsOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                  | Présence  | Rôle                                                                                                                   |
| ------------ | --------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `deadlineMs` | `number \| undefined` | Optionnel | Délai de chaque commande shell, 120000 par défaut (2 minutes). toolExecution.deadlineMs borne toujours l’appel entier. |

## Signature

```ts
export interface ShellToolsOptions {
  readonly deadlineMs?: number;
}
```
