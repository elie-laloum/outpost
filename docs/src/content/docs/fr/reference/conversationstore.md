---
title: "ConversationStore"
description: "ConversationStore — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ConversationStore } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                                                             | Présence | Rôle                                                                                    |
| --------- | -------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| `name`    | `string`                                                                         | Requis   | Identifiant de cette implémentation de stockage de conversations.                       |
| `locate`  | `(id: string, repository: string, home?: string) => Promise<ConversationRecord>` | Requis   | Recherche un transcript existant par identifiant, dépôt et home hôte optionnel.         |
| `capture` | `(id: string, context: ConversationContext) => Promise<ConversationRecord>`      | Requis   | Capture la conversation de sandbox choisie dans le dossier de capture hôte du contexte. |
| `restore` | `(record: ConversationRecord, context: ConversationContext) => Promise<void>`    | Requis   | Restaure un transcript dans la sandbox du contexte avant continuation.                  |

## Signature

```ts
export interface ConversationStore {
  readonly name: string;
  locate(
    id: string,
    repository: string,
    home?: string,
  ): Promise<ConversationRecord>;
  capture(
    id: string,
    context: ConversationContext,
  ): Promise<ConversationRecord>;
  restore(
    record: ConversationRecord,
    context: ConversationContext,
  ): Promise<void>;
}
```

## Contrats associés

- [ConversationContext](../conversationcontext/)
- [ConversationRecord](../conversationrecord/)
