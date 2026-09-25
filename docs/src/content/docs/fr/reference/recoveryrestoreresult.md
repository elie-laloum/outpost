---
title: "RecoveryRestoreResult"
description: "RecoveryRestoreResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryRestoreResult } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                           | Présence | Rôle                                                                                                                     |
| ---------------- | ------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `directory`      | `string`                       | Requis   | Nouveau dossier de checkout rempli avec l’état restauré.                                                                 |
| `commit`         | `string`                       | Requis   | Commit Git utilisé pour reconstruire l’état conservé choisi.                                                             |
| `side`           | `"previous" \| "incoming"`     | Requis   | État conservé à restaurer : previous pour l’état hôte antérieur ou incoming pour l’état distant entrant.                 |
| `staging`        | `"unavailable" \| "preserved"` | Requis   | Indique si l’index Git d’origine est préservé ; l’état distant entrant ne fournit pas d’information d’index récupérable. |
| `sourceRetained` | `true`                         | Requis   | Toujours true : la restauration conserve les artefacts de récupération d’origine.                                        |

## Signature

```ts
export interface RecoveryRestoreResult {
  readonly directory: string;
  readonly commit: string;
  readonly side: "previous" | "incoming";
  readonly staging: "preserved" | "unavailable";
  readonly sourceRetained: true;
}
```
