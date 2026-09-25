---
title: "RecoveryRetentionOptions"
description: "RecoveryRetentionOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryRetentionOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                      | Présence  | Rôle                                                                                                                      |
| ------------ | ------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------- |
| `repository` | `string \| undefined`     | Optionnel | Checkout Git hôte ciblé.                                                                                                  |
| `policy`     | `RecoveryRetentionPolicy` | Requis    | Périmètres de stockage, âge minimal et cibles de capacité explicites utilisés pour déterminer l’éligibilité au nettoyage. |
| `maxEntries` | `number \| undefined`     | Optionnel | Nombre maximal d’entrées de fichiers inspectées avant de déclarer l’inventaire incomplet.                                 |

## Signature

```ts
export interface RecoveryRetentionOptions {
  readonly repository?: string;
  readonly policy: RecoveryRetentionPolicy;
  readonly maxEntries?: number;
}
```

## Contrats associés

- [RecoveryRetentionPolicy](../recoveryretentionpolicy/)
