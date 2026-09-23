---
title: "ConversationContext"
description: "ConversationContext — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ConversationContext**. Consultez le [guide conversations](../../agents/conversations/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ConversationContext } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface ConversationContext {
  readonly repository: string;
  readonly sandbox: SandboxLease;
  readonly staging: string;
  readonly home?: string;
  readonly local?: boolean;
  readonly warn?: (message: string) => void;
}
```

## Contrats associés

- [SandboxLease](../sandboxlease/)
