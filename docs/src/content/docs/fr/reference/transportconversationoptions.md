---
title: "TransportConversationOptions"
description: "TransportConversationOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TransportConversationOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type        | Présence | Rôle                                                                                                                                        |
| ------------- | ----------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `namespace`   | `string`    | Requis   | Espace de noms logique stable du projet, indépendant des chemins des checkouts. Utiliser des espaces distincts pour des projets différents. |
| `transporter` | `Transport` | Requis   | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport. |

## Signature

```ts
export interface TransportConversationOptions extends TransportStoreOptions {
  readonly namespace: string;
}
```

## Contrats associés

- [TransportStoreOptions](../transportstoreoptions/)
