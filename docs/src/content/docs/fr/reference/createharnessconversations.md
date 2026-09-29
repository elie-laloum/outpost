---
title: "createHarnessConversations"
description: "createHarnessConversations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createHarnessConversations } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le store par défaut des agents createHarness(), dont les transcripts sont &lt;dépôt>/.outpost/conversations/harness/&lt;id>.jsonl. locate et capture vérifient seulement que ce fichier existe et échouent sinon avec le code session ; restore ne fait rien car la boucle du harness s’exécute sur l’hôte.

[Exemple complet et règles détaillées](../../guide/conversations/).

## Retour

`ConversationStore`

## Signature

```ts
export declare function createHarnessConversations(): ConversationStore;
```

## Contrats associés

- [ConversationStore](../conversationstore/)
