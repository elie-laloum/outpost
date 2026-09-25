---
title: "RecoveryRestoreOptions"
description: "RecoveryRestoreOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RecoveryRestoreOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                       | Présence  | Rôle                                                                                                          |
| ------------- | -------------------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| `directory`   | `string`                   | Requis    | Dossier hôte contenant les artefacts de transfert conservés à vérifier ou restaurer.                          |
| `repository`  | `string`                   | Requis    | Checkout Git hôte ciblé.                                                                                      |
| `destination` | `string`                   | Requis    | Nouveau dossier de destination absent, hors du dépôt source, de ses métadonnées Git et du transfert conservé. |
| `side`        | `"previous" \| "incoming"` | Requis    | État conservé à restaurer : previous pour l’état hôte antérieur ou incoming pour l’état distant entrant.      |
| `maxBytes`    | `number \| undefined`      | Optionnel | Nombre maximal d’octets de données conservées autorisé pour copier et vérifier les sources de restauration.   |

## Signature

```ts
export interface RecoveryRestoreOptions {
  readonly directory: string;
  readonly repository: string;
  readonly destination: string;
  readonly side: "previous" | "incoming";
  readonly maxBytes?: number;
}
```
