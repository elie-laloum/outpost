---
title: "nativeConversations"
description: "nativeConversations — Outpost API"
sidebar:
  order: 0
---

Contrat auxiliaire non exporté directement ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Déprécié : renvoie le ConversationStore natif intégré d’un nom de format claude, codex, copilot ou kimi, et refuse tout autre nom. Utilisez plutôt createClaudeConversations(), createCodexConversations(), createCopilotConversations() ou createKimiConversations().

## Paramètres et propriétés

| Nom      | Type     | Présence | Rôle                                                          |
| -------- | -------- | -------- | ------------------------------------------------------------- |
| `format` | `string` | Requis   | Nom de format natif intégré : claude, codex, copilot ou kimi. |

## Retour

`NativeConversationStore`

## Signature

```ts
declare function nativeConversations(
  format: ConversationFormat,
): NativeConversationStore;
```

## Contrats associés

- [ConversationFormat](../conversationformat/)
- [NativeConversationStore](../nativeconversationstore/)
