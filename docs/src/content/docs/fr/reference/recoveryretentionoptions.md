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

| Nom           | Type                      | Présence  | Rôle                                                                                                                                                                                                             |
| ------------- | ------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transporter` | `Transport \| undefined`  | Optionnel | Planifie sur les objets de ce transport au lieu du .outpost du dépôt. Seuls closed-logs et task-cache s’appliquent ; clean-workspaces ou maxWorkspaces rejettent avec le code configuration.                     |
| `repository`  | `string \| undefined`     | Optionnel | Checkout Git dont le .outpost est inspecté, process.cwd() par défaut, résolu vers son répertoire racine ; un dossier absent rejette avec le code workspace. Avec transporter, seulement enregistré dans le plan. |
| `policy`      | `RecoveryRetentionPolicy` | Requis    | Périmètres, âge minimal et limites qui décident des entrées éligibles. Validée avant l’inspection ; un champ invalide ou inconnu rejette avec le code configuration.                                             |
| `maxEntries`  | `number \| undefined`     | Optionnel | Nombre maximal de fichiers et répertoires parcourus sous .outpost, ou d’objets listés depuis transporter, 100000 par défaut. Le dépasser rend le plan incomplet : aucune entrée n’est éligible.                  |

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
