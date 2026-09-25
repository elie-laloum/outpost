---
title: "TransportObject"
description: "TransportObject — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TransportObject } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                          | Présence | Rôle                                                                                                                              |
| ------------ | ----------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `bytes`      | `Uint8Array<ArrayBufferLike>` | Requis   | Contenu binaire complet, sans l’enveloppe de stockage de l’adaptateur.                                                            |
| `key`        | `string`                      | Requis   | Clé logique relative ; segments sûrs séparés par des slashs, jusqu’à 512 caractères. Ce n’est ni un chemin de fichier ni une URL. |
| `revision`   | `string`                      | Requis   | Jeton de version opaque utilisé pour les écritures et suppressions conditionnelles ; ce n’est pas un digest du contenu.           |
| `size`       | `number`                      | Requis   | Taille utile en octets, hors enveloppe du transport et surcoûts du backend.                                                       |
| `modifiedAt` | `string`                      | Requis   | Horodatage ISO de la version stockée, utilisé comme observation pour la rétention.                                                |

## Signature

```ts
export interface TransportObject extends TransportEntry {
  readonly bytes: Uint8Array;
}
```

## Contrats associés

- [TransportEntry](../transportentry/)
