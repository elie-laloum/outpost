---
title: "RecoveryVerification"
description: "RecoveryVerification — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryVerification } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                               | Présence  | Rôle                                                                                                                                                          |
| ----------- | -------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `directory` | `string`                                           | Requis    | Chemin réel résolu du dossier de transfert vérifié.                                                                                                           |
| `scope`     | `"transfer-structure" \| "transfer-restorability"` | Requis    | transfer-restorability quand restorability a été demandé, sinon transfer-structure.                                                                           |
| `complete`  | `boolean`                                          | Requis    | Indique si tous les contrôles ont réussi.                                                                                                                     |
| `integrity` | `RecoveryIntegrity`                                | Requis    | checksums-match ou checksums-mismatch après vérification des empreintes ; unverified quand elles n’ont pas été demandées ou n’ont pas pu aller au bout.       |
| `checksums` | `RecoveryChecksumResult \| undefined`              | Optionnel | Intégrité des empreintes, bytesChecked, maxBytes et contrôles par fichier ; présent quand checksums a été demandé et que les contrôles précédents ont réussi. |
| `checks`    | `readonly RecoveryStructureCheck[]`                | Requis    | Chaque contrôle exécuté, dans l’ordre, avec chemin, statut pass ou fail et un code comme FILE_PRESENT, CHECKSUM_MISMATCH ou PATCH_APPLIES.                    |

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
