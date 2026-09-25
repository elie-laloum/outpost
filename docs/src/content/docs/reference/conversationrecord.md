---
title: "ConversationRecord"
description: "ConversationRecord — Outpost API"
sidebar:
  order: 10
---

Public contract for **ConversationRecord**. See the [conversations guide](../../guide/agents/conversations/) for behavior, defaults and examples.

## Import

```ts
import type { ConversationRecord } from "@elie-laloum/outpost";
```

## Purpose and behavior

Locate, capture, restore and relocate native transcripts separately from authentication.

The host conversation home defaults to the OS home. A cold continuation requires a restorable transcript before allocation. A fork does not copy a workspace.

[Complete example and detailed rules](../../guide/agents/conversations/).

## Parameters and properties

| Name     | Type     | Presence | Meaning                                                                 |
| -------- | -------- | -------- | ----------------------------------------------------------------------- |
| `id`     | `string` | Required | See the linked contract and this family's rules for its interpretation. |
| `file`   | `string` | Required | See the linked contract and this family's rules for its interpretation. |
| `format` | `string` | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface ConversationRecord {
  readonly id: string;
  readonly file: string;
  readonly format: string;
}
```
