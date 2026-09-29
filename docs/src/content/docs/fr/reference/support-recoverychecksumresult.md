---
title: "RecoveryChecksumResult"
description: "RecoveryChecksumResult — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom            | Type                                | Présence | Rôle                                                                                                                                                                                                                                       |
| -------------- | ----------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `integrity`    | `RecoveryIntegrity`                 | Requis   | checksums-match lorsque chaque entrée du manifeste correspond, checksums-mismatch lorsqu’une entrée diffère, unverified lorsque le manifeste est absent ou invalide ou qu’un fichier n’a pas pu être haché dans la limite maxBytes.        |
| `bytesChecked` | `number`                            | Requis   | Nombre d’octets de données réellement hachés pendant la vérification.                                                                                                                                                                      |
| `maxBytes`     | `number`                            | Requis   | Limite de hachage, 1073741824 (1 Gio) par défaut. L’atteindre arrête la vérification avec un contrôle CHECKSUM_LIMIT et laisse integrity à unverified.                                                                                     |
| `checks`       | `readonly RecoveryStructureCheck[]` | Requis   | Un contrôle par entrée du manifeste, CHECKSUM_MATCH ou CHECKSUM_MISMATCH, arrêté plus tôt par CHECKSUM_LIMIT ou CHECKSUM_UNAVAILABLE ; ou un seul contrôle en échec sur le manifeste : CHECKSUMS_UNAVAILABLE ou INVALID_CHECKSUM_MANIFEST. |

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
