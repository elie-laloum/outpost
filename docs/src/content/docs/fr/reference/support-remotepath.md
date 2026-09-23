---
title: "remotePath"
description: "remotePath — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Signature

```ts
export declare function remotePath(
  format: ConversationFormat,
  id: string,
  lease: SandboxLease,
  original: string,
): string;
```

## Contrats associés

- [ConversationFormat](../conversationformat/)
- [SandboxLease](../sandboxlease/)
