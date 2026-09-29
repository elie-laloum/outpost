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

| Nom              | Type                           | Présence | Rôle                                                                                                                         |
| ---------------- | ------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `directory`      | `string`                       | Requis   | Destination créée : un clone du dépôt détaché sur commit, sans remote origin, avec les changements du côté choisi appliqués. |
| `commit`         | `string`                       | Requis   | Commit sur lequel la destination est détachée.                                                                               |
| `side`           | `"previous" \| "incoming"`     | Requis   | Côté restauré, repris du plan.                                                                                               |
| `staging`        | `"unavailable" \| "preserved"` | Requis   | preserved lorsque les changements indexés du côté previous ont été restaurés dans l’index Git ; unavailable pour incoming.   |
| `sourceRetained` | `true`                         | Requis   | Toujours true : le dossier du transfert reste en place après la restauration.                                                |

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
