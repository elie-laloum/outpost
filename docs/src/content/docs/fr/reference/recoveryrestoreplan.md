---
title: "RecoveryRestorePlan"
description: "RecoveryRestorePlan — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryRestorePlan**. Consultez le [guide restauration de récupération](../../guide/operations/recovery-restoration/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { RecoveryRestorePlan } from "@elie-laloum/outpost";
```

## Rôle et comportement

Planifier puis appliquer un transfert conservé vers une nouvelle destination à relire.

Restaurez dans un nouveau dossier et examinez avant intégration. La vérification contrôle structure et intégrité enregistrées ; elle n’authentifie pas l’auteur.

[Exemple complet et règles détaillées](../../guide/operations/recovery-restoration/).

## Paramètres et propriétés

| Nom              | Type                           | Présence  | Rôle                                                                             |
| ---------------- | ------------------------------ | --------- | -------------------------------------------------------------------------------- |
| `fingerprint`    | `string`                       | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `manifestSha256` | `string`                       | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `commit`         | `string`                       | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `payloads`       | `readonly string[]`            | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `staging`        | `"unavailable" \| "preserved"` | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `directory`      | `string`                       | Requis    | Dossier utilisé par l’opération ; voir les règles de résolution.                 |
| `repository`     | `string`                       | Requis    | Checkout Git hôte ciblé.                                                         |
| `destination`    | `string`                       | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `side`           | `"previous" \| "incoming"`     | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `maxBytes`       | `number \| undefined`          | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface RecoveryRestorePlan extends RecoveryRestoreOptions {
  readonly fingerprint: string;
  readonly manifestSha256: string;
  readonly commit: string;
  readonly payloads: readonly string[];
  readonly staging: "preserved" | "unavailable";
}
```

## Contrats associés

- [RecoveryRestoreOptions](../recoveryrestoreoptions/)
