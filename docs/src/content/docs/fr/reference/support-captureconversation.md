---
title: "captureConversation"
description: "captureConversation — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Signature

```ts
export declare function captureConversation(
  format: ConversationFormat,
  id: string,
  repository: string,
  lease: SandboxLease,
  staging: string,
  options?: CaptureOptions,
): Promise<ConversationLocation>;
```

## Contrats associés

- [CaptureOptions](../support-captureoptions/)
- [ConversationFormat](../conversationformat/)
- [ConversationLocation](../conversationlocation/)
- [SandboxLease](../sandboxlease/)
