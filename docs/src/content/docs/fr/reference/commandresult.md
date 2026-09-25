---
title: "CommandResult"
description: "CommandResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CommandResult } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom      | Type     | Présence | Rôle                                                  |
| -------- | -------- | -------- | ----------------------------------------------------- |
| `status` | `number` | Requis   | Code de sortie du processus ; zéro indique le succès. |
| `stdout` | `string` | Requis   | Sortie standard capturée.                             |
| `stderr` | `string` | Requis   | Sortie d’erreur capturée.                             |

## Signature

```ts
export interface CommandResult {
  readonly status: number;
  readonly stdout: string;
  readonly stderr: string;
}
```
