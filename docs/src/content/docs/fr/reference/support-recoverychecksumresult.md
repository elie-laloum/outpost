---
title: "RecoveryChecksumResult"
description: "RecoveryChecksumResult — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom            | Type                                | Présence | Rôle                                                                                                |
| -------------- | ----------------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `integrity`    | `RecoveryIntegrity`                 | Requis   | Conclusion d’intégrité issue du manifeste enregistré et de la vérification d’empreintes disponible. |
| `bytesChecked` | `number`                            | Requis   | Nombre d’octets de données réellement hachés pendant la vérification.                               |
| `maxBytes`     | `number`                            | Requis   | Nombre maximal d’octets de données autorisé pour la vérification des empreintes.                    |
| `checks`       | `readonly RecoveryStructureCheck[]` | Requis   | Résultats de vérification par chemin avec statut pass/fail et code de diagnostic.                   |

## Signature

```ts
export interface RecoveryChecksumResult {
  readonly integrity: RecoveryIntegrity;
  readonly bytesChecked: number;
  readonly maxBytes: number;
  readonly checks: readonly RecoveryStructureCheck[];
}
```

## Contrats associés

- [RecoveryIntegrity](../support-recoveryintegrity/)
- [RecoveryStructureCheck](../support-recoverystructurecheck/)
