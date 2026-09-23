---
title: "locateConversation"
description: "locateConversation — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Signature

```ts
export declare function locateConversation(
  format: ConversationFormat,
  id: string,
  repository: string,
  home?: string,
): Promise<ConversationLocation>;
```

## Contrats associés

- [ConversationFormat](../conversationformat/)
- [ConversationLocation](../conversationlocation/)
