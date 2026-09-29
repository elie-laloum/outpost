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

| Nom      | Type     | Présence | Rôle                                                                                                                                                                                                     |
| -------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status` | `number` | Requis   | Code de sortie du processus, 0 en cas de succès. Un code non nul résout quand même la commande : vérifiez-le.                                                                                            |
| `stdout` | `string` | Requis   | Derniers caractères de la sortie standard, dans la limite de retain. Vide quand une commande interactive sans flux de terminal utilisait le terminal de l’hôte avec le provider local, Docker ou Podman. |
| `stderr` | `string` | Requis   | Derniers caractères de la sortie d’erreur, dans la limite de retain. Vide dans le même cas de terminal hôte, et pour un terminal Daytona, dont toute la sortie est dans stdout.                          |

## Signature

```ts
export interface CommandResult {
  readonly status: number;
  readonly stdout: string;
  readonly stderr: string;
}
```
