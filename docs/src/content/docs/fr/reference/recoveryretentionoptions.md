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

| Nom           | Type                      | Présence  | Rôle                                                                                                                                                  |
| ------------- | ------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transporter` | `Transport \| undefined`  | Optionnel | Inspecte les objets distants et prépare la rétention des journaux fermés. Le nettoyage des workspaces locaux est incompatible avec le mode transport. |
| `repository`  | `string \| undefined`     | Optionnel | Checkout Git hôte ciblé.                                                                                                                              |
| `policy`      | `RecoveryRetentionPolicy` | Requis    | Périmètres de stockage, âge minimal et cibles de capacité explicites utilisés pour déterminer l’éligibilité au nettoyage.                             |
| `maxEntries`  | `number \| undefined`     | Optionnel | Nombre maximal d’entrées de fichiers inspectées avant de déclarer l’inventaire incomplet.                                                             |

## Signature

```ts
export interface RecoveryRetentionOptions {
  readonly transporter?: Transport;
  readonly repository?: string;
  readonly policy: RecoveryRetentionPolicy;
  readonly maxEntries?: number;
}
```

## Contrats associés

- [RecoveryRetentionPolicy](../recoveryretentionpolicy/)
- [Transport](../transport/)
