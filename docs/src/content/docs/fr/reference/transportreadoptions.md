---
title: "TransportReadOptions"
description: "TransportReadOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TransportReadOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                       | Présence  | Rôle                                                                                                             |
| ---------- | -------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------- |
| `signal`   | `AbortSignal \| undefined` | Optionnel | Annule la lecture ou le listing ; l’appel échoue au lieu de renvoyer undefined.                                  |
| `maxBytes` | `number \| undefined`      | Optionnel | Plus grand contenu accepté par une lecture, 64 Mio par défaut ; un objet plus grand est refusé. list() l’ignore. |

## Signature

```ts
export interface TransportReadOptions {
  readonly signal?: AbortSignal;
  readonly maxBytes?: number;
}
```
