---
title: "ConversationLocation"
description: "ConversationLocation — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ConversationLocation**. Consultez le [guide conversations](../../agents/conversations/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ConversationLocation } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface ConversationLocation {
  readonly id: string;
  readonly file: string;
  readonly format: ConversationFormat;
}
```

## Contrats associés

- [ConversationFormat](../conversationformat/)
