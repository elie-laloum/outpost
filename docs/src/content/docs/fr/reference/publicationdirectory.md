---
title: "PublicationDirectory"
description: "PublicationDirectory — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { PublicationDirectory } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                                                   | Présence  | Rôle                                                                                                                          |
| ------------- | ---------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `path`        | `string`                                                               | Requis    | Chemin relatif validé conservant son préfixe ; traversées et chemins de contrôle sont refusés.                                |
| `mode`        | `number`                                                               | Requis    | Bits de permissions portables conservés pour les fichiers ordinaires et les répertoires.                                      |
| `identity`    | `{ readonly device: number; readonly inode: number; } \| undefined`    | Optionnel | Identité device/inode utilisée pour détecter les remplacements et les aliases connus du filesystem.                           |
| `createdMode` | `number \| undefined`                                                  | Optionnel | Permissions initiales du répertoire possédé, conservées pour distinguer changements de publication et modifications externes. |
| `phase`       | `"pending" \| "restored" \| "create-intent" \| "created" \| "settled"` | Requis    | Phase durable d’intention/résultat permettant finish ou rollback sans réexécuter les tâches du workflow.                      |

## Signature

```ts
export interface PublicationDirectory {
  readonly path: string;
  readonly mode: number;
  identity?: {
    readonly device: number;
    readonly inode: number;
  };
  createdMode?: number;
  phase: "pending" | "create-intent" | "created" | "settled" | "restored";
}
```
