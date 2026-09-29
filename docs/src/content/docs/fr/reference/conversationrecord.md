---
title: "ConversationRecord"
description: "ConversationRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ConversationRecord } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                              | Présence  | Rôle                                                                                                                                                                                     |
| ----------- | --------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`        | `string`                          | Requis    | Identifiant de conversation native utilisé pour localiser ou poursuivre la session.                                                                                                      |
| `file`      | `string`                          | Requis    | Chemin sur l’hôte du transcript ou du bundle de session capturé.                                                                                                                         |
| `reference` | `TransportReference \| undefined` | Optionnel | Clé de transport et révision de l’index de la conversation, renseignées par createTransportConversations(). file désigne toujours une copie locale lisible.                              |
| `format`    | `string`                          | Requis    | Format du store qui a produit l’enregistrement. Les stores de transcripts et de bundles de session refusent de restaurer un enregistrement d’un autre format avec le code configuration. |

## Signature

```ts
export interface ConversationRecord {
  readonly id: string;
  readonly file: string;
  readonly reference?: TransportReference;
  readonly format: string;
}
```

## Contrats associés

- [TransportReference](../transportreference/)
