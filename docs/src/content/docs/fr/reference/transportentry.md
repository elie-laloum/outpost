---
title: "TransportEntry"
description: "TransportEntry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TransportEntry } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type     | Présence | Rôle                                                                                                                              |
| ------------ | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `key`        | `string` | Requis   | Clé logique relative ; segments sûrs séparés par des slashs, jusqu’à 512 caractères. Ce n’est ni un chemin de fichier ni une URL. |
| `revision`   | `string` | Requis   | Jeton de version opaque utilisé pour les écritures et suppressions conditionnelles ; ce n’est pas un digest du contenu.           |
| `size`       | `number` | Requis   | Taille utile en octets, hors enveloppe du transport et surcoûts du backend.                                                       |
| `modifiedAt` | `string` | Requis   | Horodatage ISO de la version stockée, utilisé comme observation pour la rétention.                                                |

## Signature

```ts
export interface TransportEntry {
  readonly key: string;
  readonly revision: string;
  readonly size: number;
  readonly modifiedAt: string;
}
```
