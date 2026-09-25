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

| Nom         | Type                                               | Présence  | Rôle                                                                                                     |
| ----------- | -------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| `directory` | `string`                                           | Requis    | Dossier hôte contenant les artefacts de transfert conservés à vérifier ou restaurer.                     |
| `scope`     | `"transfer-structure" \| "transfer-restorability"` | Requis    | Indique si la vérification couvre seulement la structure du transfert ou aussi sa restauration Git.      |
| `complete`  | `boolean`                                          | Requis    | Indique si toute l’inspection demandée s’est terminée sans limite de parcours ni entrée inaccessible.    |
| `integrity` | `RecoveryIntegrity`                                | Requis    | Conclusion d’intégrité issue du manifeste enregistré et de la vérification d’empreintes disponible.      |
| `checksums` | `RecoveryChecksumResult \| undefined`              | Optionnel | Résultats détaillés des empreintes, nombre d’octets et état d’intégrité lorsque le calcul a été demandé. |
| `checks`    | `readonly RecoveryStructureCheck[]`                | Requis    | Résultats de vérification par chemin avec statut pass/fail et code de diagnostic.                        |

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
