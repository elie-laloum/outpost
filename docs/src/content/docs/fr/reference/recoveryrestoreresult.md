---
title: "RecoveryRestoreResult"
description: "RecoveryRestoreResult — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryRestoreResult**. Consultez le [guide restauration de récupération](../../guide/operations/recovery-restoration/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { RecoveryRestoreResult } from "@elie-laloum/outpost";
```

## Rôle et comportement

Planifier puis appliquer un transfert conservé vers une nouvelle destination à relire.

Restaurez dans un nouveau dossier et examinez avant intégration. La vérification contrôle structure et intégrité enregistrées ; elle n’authentifie pas l’auteur.

[Exemple complet et règles détaillées](../../guide/operations/recovery-restoration/).

## Paramètres et propriétés

| Nom              | Type                           | Présence | Rôle                                                                             |
| ---------------- | ------------------------------ | -------- | -------------------------------------------------------------------------------- |
| `directory`      | `string`                       | Requis   | Dossier utilisé par l’opération ; voir les règles de résolution.                 |
| `commit`         | `string`                       | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `side`           | `"previous" \| "incoming"`     | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `staging`        | `"unavailable" \| "preserved"` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `sourceRetained` | `true`                         | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
