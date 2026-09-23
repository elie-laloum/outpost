---
title: "CommonAgentSettings"
description: "CommonAgentSettings — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Signature

```ts
export interface CommonAgentSettings {
  readonly model?: string;
  readonly variables?: Variables;
  readonly saveConversations?: boolean;
}
```

## Contrats associés

- [Variables](../variables/)
