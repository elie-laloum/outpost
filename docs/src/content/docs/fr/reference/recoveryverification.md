---
title: "RecoveryVerification"
description: "RecoveryVerification — Outpost API"
sidebar:
  order: 10
---

Contrat public de **RecoveryVerification**. Consultez le [guide récupération et rétention](../../guide/operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { RecoveryVerification } from "@elie-laloum/outpost";
```

## Rôle et comportement

Inspecter le travail conservé et planifier explicitement sa rétention sans abandonner les modifications récupérables.

Planifier ne supprime rien. L’application reprend possession et revalide les candidats. Les quotas observent l’usage plutôt que d’imposer une limite physique au système de fichiers.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom         | Type                                               | Présence  | Rôle                                                                             |
| ----------- | -------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `directory` | `string`                                           | Requis    | Dossier utilisé par l’opération ; voir les règles de résolution.                 |
| `scope`     | `"transfer-structure" \| "transfer-restorability"` | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `complete`  | `boolean`                                          | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `integrity` | `RecoveryIntegrity`                                | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `checksums` | `RecoveryChecksumResult \| undefined`              | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `checks`    | `readonly RecoveryStructureCheck[]`                | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface RecoveryVerification {
  readonly directory: string;
  readonly scope: "transfer-structure" | "transfer-restorability";
  readonly complete: boolean;
  readonly integrity: RecoveryIntegrity;
  readonly checksums?: RecoveryChecksumResult;
  readonly checks: readonly RecoveryStructureCheck[];
}
```

## Contrats associés

- [RecoveryChecksumResult](../support-recoverychecksumresult/)
- [RecoveryIntegrity](../support-recoveryintegrity/)
- [RecoveryStructureCheck](../support-recoverystructurecheck/)
