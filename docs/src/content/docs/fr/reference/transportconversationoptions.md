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

| Nom           | Type        | Présence | Rôle                                                                                                                                                                                                                                 |
| ------------- | ----------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `namespace`   | `string`    | Requis   | Nom du projet dans les clés, conversations/&lt;namespace>/&lt;format>/&lt;id> ; doit être une clé de transport valide. Utilisez la même valeur sur chaque machine qui reprend ces conversations, et une valeur distincte par projet. |
| `transporter` | `Transport` | Requis   | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport.                                                                                          |

## Signature

```ts
export interface TransportConversationOptions extends TransportStoreOptions {
  readonly namespace: string;
}
```

## Contrats associés

- [TransportStoreOptions](../transportstoreoptions/)
