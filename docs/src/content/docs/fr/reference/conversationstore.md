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

| Nom       | Type                                                                             | Présence  | Rôle                                                                                                                                                                                                                                                               |
| --------- | -------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`    | `string`                                                                         | Requis    | Nom du store, par exemple claude ou transport:&lt;namespace>:&lt;format>. Outpost l’associe à l’identifiant de conversation pour ne pas restaurer une conversation déjà présente dans la sandbox.                                                                  |
| `format`  | `string \| undefined`                                                            | Optionnel | Format persisté que ce store lit et écrit, par exemple claude, codex, copilot, kimi ou harness. Un harness refuse à sa création un store d’un autre format avec le code configuration, et createTransportConversations() exige un store de base qui en déclare un. |
| `locate`  | `(id: string, repository: string, home?: string) => Promise<ConversationRecord>` | Requis    | Retrouve une conversation capturée sur l’hôte à partir de son identifiant, du dépôt et d’un home optionnel, avant sa restauration. Échoue quand la conversation est absente.                                                                                       |
| `capture` | `(id: string, context: ConversationContext) => Promise<ConversationRecord>`      | Requis    | Enregistre la conversation id depuis la sandbox du contexte vers l’hôte après un tour et renvoie son enregistrement.                                                                                                                                               |
| `restore` | `(record: ConversationRecord, context: ConversationContext) => Promise<void>`    | Requis    | Écrit un enregistrement localisé dans la sandbox du contexte avant un tour de continuation, en relocalisant les chemins enregistrés vers le workspace de la sandbox.                                                                                               |

## Signature

```ts
export interface ConversationStore {
  readonly name: string;
  readonly format?: string;
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
