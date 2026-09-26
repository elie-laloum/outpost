---
title: "harnessConversations"
description: "harnessConversations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { harnessConversations } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le store de conversations par défaut des harness personnalisés. Les transcriptions se trouvent dans .outpost/conversations/harness du dépôt cible ; localiser une conversation absente échoue avec le code session, et restore ne fait rien car la boucle tourne sur l’hôte.

[Exemple complet et règles détaillées](../../guide/agents/conversations/).

## Retour

`ConversationStore`

## Signature

```ts
export declare function harnessConversations(): ConversationStore;
```

## Contrats associés

- [ConversationStore](../conversationstore/)
