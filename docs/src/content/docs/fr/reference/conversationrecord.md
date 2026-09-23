---
title: "ConversationRecord"
description: "ConversationRecord — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ConversationRecord**. Consultez le [guide conversations](../../agents/conversations/) pour le comportement, les valeurs par défaut et des exemples.

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
