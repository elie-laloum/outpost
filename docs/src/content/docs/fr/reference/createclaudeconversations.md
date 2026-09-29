---
title: "createClaudeConversations"
description: "createClaudeConversations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createClaudeConversations } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le ConversationStore natif de Claude Code. Les transcripts sont des fichiers JSONL uniques sous ~/.claude/projects/&lt;clé du projet>, avec les transcripts enfants sous &lt;id>/subagents ; capture et restauration réécrivent les cwd enregistrés pour le workspace de destination. C’est le store par défaut de createClaudeHarness().

[Exemple complet et règles détaillées](../../guide/conversations/).

## Retour

`NativeConversationStore`

## Signature

```ts
export declare function createClaudeConversations(): NativeConversationStore;
```

## Contrats associés

- [NativeConversationStore](../nativeconversationstore/)
