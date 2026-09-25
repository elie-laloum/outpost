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

| Nom        | Type                       | Présence  | Rôle                                                                                                                                  |
| ---------- | -------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `signal`   | `AbortSignal \| undefined` | Optionnel | Annule la lecture ou le listing sans assimiler l’annulation à un objet absent.                                                        |
| `maxBytes` | `number \| undefined`      | Optionnel | Nombre maximal d’octets utiles pour une lecture, 64 Mio par défaut. Le listing renvoie des métadonnées et n’utilise pas cette limite. |

## Signature

```ts
export interface TransportReadOptions {
  readonly signal?: AbortSignal;
  readonly maxBytes?: number;
}
```
