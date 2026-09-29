---
title: "createTransportConversations"
description: "createTransportConversations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createTransportConversations } from "@elie-laloum/outpost";
```

## Rôle et comportement

Enveloppe un ConversationStore de base qui déclare un format, par exemple createKimiConversations(), pour archiver aussi chaque capture sous conversations/&lt;namespace>/&lt;format>/&lt;id>. locate() matérialise le dernier snapshot sous .outpost/recovery/conversations du dépôt et restore() délègue au store de base. Les archives ne sont ni chiffrées ni authentifiées.

[Exemple complet et règles détaillées](../../guide/conversations/).

## Paramètres et propriétés

| Nom                   | Type                           | Présence | Rôle                                                                                                                                                                                                                                 |
| --------------------- | ------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `base`                | `ConversationStore`            | Requis   | Store dont les captures sont archivées, par exemple createKimiConversations() ou createHarnessConversations(). Sans format, la création échoue avec le code configuration.                                                           |
| `options`             | `TransportConversationOptions` | Requis   | Transport et espace de noms stable du projet, partagé par les exécuteurs restaurant ces conversations.                                                                                                                               |
| `options.namespace`   | `string`                       | Requis   | Nom du projet dans les clés, conversations/&lt;namespace>/&lt;format>/&lt;id> ; doit être une clé de transport valide. Utilisez la même valeur sur chaque machine qui reprend ces conversations, et une valeur distincte par projet. |
| `options.transporter` | `Transport`                    | Requis   | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport.                                                                                          |

## Retour

`ConversationStore`

## Signature

```ts
export declare function createTransportConversations(
  base: ConversationStore,
  options: TransportConversationOptions,
): ConversationStore;
```

## Contrats associés

- [ConversationStore](../conversationstore/)
- [TransportConversationOptions](../transportconversationoptions/)
