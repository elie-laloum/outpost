---
title: "ConversationRecord"
description: "ConversationRecord — Outpost API"
sidebar:
  order: 10
---

Public contract for **ConversationRecord**. See the [conversations guide](../../agents/conversations/) for behavior, defaults and examples.

## Import

```ts
import type { ConversationRecord } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface ConversationRecord {
  readonly id: string;
  readonly file: string;
  readonly format: string;
}
```
