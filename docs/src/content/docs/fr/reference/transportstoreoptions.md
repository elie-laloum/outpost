---
title: "TransportStoreOptions"
description: "TransportStoreOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TransportStoreOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type        | Présence | Rôle                                                                                                                                        |
| ------------- | ----------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `transporter` | `Transport` | Requis   | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport. |

## Signature

```ts
export interface TransportStoreOptions {
  readonly transporter: Transport;
}
```

## Contrats associés

- [Transport](../transport/)
