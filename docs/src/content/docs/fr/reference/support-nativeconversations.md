---
title: "nativeConversations"
description: "nativeConversations — Outpost API"
sidebar:
  order: 0
---

Contrat auxiliaire non exporté directement ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Crée le ConversationStore natif du format Claude ou Codex choisi, en liant localisation, capture et restauration à son organisation de fichiers.

## Paramètres et propriétés

| Nom      | Type                 | Présence | Rôle                                                   |
| -------- | -------------------- | -------- | ------------------------------------------------------ |
| `format` | `ConversationFormat` | Requis   | Organisation native des transcripts : claude ou codex. |

## Retour

`ConversationStore`

## Signature

```ts
export declare function nativeConversations(
  format: ConversationFormat,
): ConversationStore;
```

## Contrats associés

- [ConversationFormat](../conversationformat/)
- [ConversationStore](../conversationstore/)
