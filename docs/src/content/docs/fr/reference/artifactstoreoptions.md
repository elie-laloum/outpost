---
title: "ArtifactStoreOptions"
description: "ArtifactStoreOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ArtifactStoreOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                  | Présence  | Rôle                                                                                                                                        |
| ------------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `maxBytes`    | `number \| undefined` | Optionnel | Taille maximale positive d’un artefact en octets, 16 Mio par défaut ; vérifiée avant publication et pendant la lecture.                     |
| `transporter` | `Transport`           | Requis    | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport. |

## Signature

```ts
export interface ArtifactStoreOptions extends TransportStoreOptions {
  readonly maxBytes?: number;
}
```

## Contrats associés

- [TransportStoreOptions](../transportstoreoptions/)
