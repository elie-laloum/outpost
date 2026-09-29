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

| Nom           | Type                       | Présence  | Rôle                                                                                                                                                                                                |
| ------------- | -------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `directory`   | `string`                   | Requis    | Dossier du transfert conservé, tel que l’indique details.recovery de l’erreur de synchronisation. Il doit contenir state.json et checksums.json.                                                    |
| `repository`  | `string`                   | Requis    | Dépôt Git hôte cloné dans la destination ; il est seulement lu. Un dépôt partiel, superficiel (shallow) ou à objets alternates échoue au contrôle Git.                                              |
| `destination` | `string`                   | Requis    | Nouveau dossier à créer. Son parent doit exister ; le chemin ne doit pas exister et doit se trouver hors du dépôt, de ses métadonnées Git et du transfert.                                          |
| `side`        | `"previous" \| "incoming"` | Requis    | previous restaure le worktree hôte tel qu’il était sauvegardé avant le transfert, index Git compris ; incoming restaure les commits, changements non commités et fichiers non suivis de la sandbox. |
| `maxBytes`    | `number \| undefined`      | Optionnel | Nombre maximal d’octets du transfert copiés et hachés, 1073741824 (1 Gio) par défaut. Un dépassement rejette avec le code configuration.                                                            |

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
