---
title: "RecoveryVerificationOptions"
description: "RecoveryVerificationOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryVerificationOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom             | Type                   | Présence  | Rôle                                                                                                                                                                                                                                   |
| --------------- | ---------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `restorability` | `boolean \| undefined` | Optionnel | Clone repository dans un dossier temporaire et vérifie que les commits existent, que le bundle se décompresse et que les trois patches s’appliquent. S’exécute seulement si les contrôles de structure réussissent ; exige repository. |
| `repository`    | `string \| undefined`  | Optionnel | Checkout Git cloné pour le contrôle de restauration ; un clone superficiel ou partiel, ou avec des alternates, fait échouer ce contrôle.                                                                                               |
| `checksums`     | `boolean \| undefined` | Optionnel | Calcule le SHA-256 de chaque fichier listé dans checksums.json et compare type, taille et empreinte. S’exécute seulement si les contrôles précédents réussissent.                                                                      |
| `maxBytes`      | `number \| undefined`  | Optionnel | Nombre maximal d’octets hachés pour les empreintes, 1073741824 (1 Gio) par défaut. Le dépasser échoue avec CHECKSUM_LIMIT et laisse integrity à unverified.                                                                            |

## Signature

```ts
export interface RecoveryVerificationOptions {
  readonly restorability?: boolean;
  readonly repository?: string;
  readonly checksums?: boolean;
  readonly maxBytes?: number;
}
```
