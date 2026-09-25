---
title: "CommandResult"
description: "CommandResult — Outpost API"
sidebar:
  order: 10
---

Contrat public de **CommandResult**. Consultez le [guide commandes et terminal](../../guide/environment/commands/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { CommandResult } from "@elie-laloum/outpost";
```

## Rôle et comportement

Exécuter un processus ou attacher une session interactive native avec possession explicite des flux.

Command renvoie les statuts non nuls ; l’appelant doit les vérifier. Attach exige un provider interactif compatible. Vercel rejette l’attachement.

[Exemple complet et règles détaillées](../../guide/environment/commands/).

## Paramètres et propriétés

| Nom      | Type     | Présence | Rôle                                                              |
| -------- | -------- | -------- | ----------------------------------------------------------------- |
| `status` | `number` | Requis   | Résultat enregistré du processus ou cycle de vie ; voir son type. |
| `stdout` | `string` | Requis   | Sortie standard capturée.                                         |
| `stderr` | `string` | Requis   | Sortie d’erreur capturée.                                         |

## Signature

```ts
export interface CommandResult {
  readonly status: number;
  readonly stdout: string;
  readonly stderr: string;
}
```
