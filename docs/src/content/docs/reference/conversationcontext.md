---
title: "ConversationContext"
description: "ConversationContext — Outpost API"
sidebar:
  order: 10
---

Public contract for **ConversationContext**. See the [conversations guide](../../agents/conversations/) for behavior, defaults and examples.

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

## Related contracts

- [SandboxLease](../sandboxlease/)
