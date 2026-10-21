---
title: "ObservationReadOptions"
description: "ObservationReadOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ObservationReadOptions } from "@elie-laloum/outpost/core";
```

## Paramètres et propriétés

| Nom        | Type                       | Présence  | Rôle                                                                                                     |
| ---------- | -------------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| `signal`   | `AbortSignal \| undefined` | Optionnel | Annule uniquement les lectures et interrogations du suivi ; jamais l’exécution observée.                 |
| `maxBytes` | `number \| undefined`      | Optionnel | Limite de lecture par objet en octets, 8388608 par défaut ; les fiches ou segments trop grands échouent. |

## Signature

```ts
export interface ObservationReadOptions extends Omit<
  ReadRunOptions,
  "transporter" | "id"
> {}
```

## Contrats associés

- [ReadRunOptions](../readrunoptions/)
