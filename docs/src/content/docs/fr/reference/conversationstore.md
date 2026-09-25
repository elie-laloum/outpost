---
title: "ConversationStore"
description: "ConversationStore — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ConversationStore**. Consultez le [guide conversations](../../guide/agents/conversations/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ConversationStore } from "@elie-laloum/outpost";
```

## Rôle et comportement

Localiser, capturer, restaurer et déplacer les transcripts natifs séparément de l’authentification.

Le home de conversation vaut par défaut le home système. Une continuation froide exige un transcript restaurable avant allocation. Un fork ne copie pas un workspace.

[Exemple complet et règles détaillées](../../guide/agents/conversations/).

## Paramètres et propriétés

| Nom       | Type                                                                             | Présence | Rôle                                                                             |
| --------- | -------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `name`    | `string`                                                                         | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `locate`  | `(id: string, repository: string, home?: string) => Promise<ConversationRecord>` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `capture` | `(id: string, context: ConversationContext) => Promise<ConversationRecord>`      | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `restore` | `(record: ConversationRecord, context: ConversationContext) => Promise<void>`    | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
