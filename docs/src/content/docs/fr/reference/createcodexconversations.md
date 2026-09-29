---
title: "createCodexConversations"
description: "createCodexConversations — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createCodexConversations } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le ConversationStore natif de Codex. Les rollouts sont des fichiers JSONL nommés *-&lt;id>.jsonl sous ~/.codex/sessions ; la capture les écrit dans le dossier daté du jour et réécrit les cwd enregistrés. C’est le store par défaut de createCodexHarness().

[Exemple complet et règles détaillées](../../guide/conversations/).

## Retour

`NativeConversationStore`

## Signature

```ts
export declare function createCodexConversations(): NativeConversationStore;
```

## Contrats associés

- [NativeConversationStore](../nativeconversationstore/)
