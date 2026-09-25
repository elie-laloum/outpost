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

| Nom             | Type                   | Présence  | Rôle                                                                                             |
| --------------- | ---------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| `restorability` | `boolean \| undefined` | Optionnel | Vérifie aussi que les bundles et patches Git conservés peuvent reconstruire l’état enregistré.   |
| `repository`    | `string \| undefined`  | Optionnel | Checkout Git hôte ciblé.                                                                         |
| `checksums`     | `boolean \| undefined` | Optionnel | Calcule et compare les empreintes enregistrées des données pendant la vérification du transfert. |
| `maxBytes`      | `number \| undefined`  | Optionnel | Nombre maximal d’octets de données autorisé pour la vérification des empreintes.                 |

## Signature

```ts
export interface RecoveryVerificationOptions {
  readonly restorability?: boolean;
  readonly repository?: string;
  readonly checksums?: boolean;
  readonly maxBytes?: number;
}
```
