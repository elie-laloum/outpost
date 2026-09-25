---
title: "ConversationRecord"
description: "ConversationRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ConversationRecord } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type     | Presence | Meaning                                                                |
| -------- | -------- | -------- | ---------------------------------------------------------------------- |
| `id`     | `string` | Required | Native conversation identifier used to locate or continue the session. |
| `file`   | `string` | Required | Host path of the native transcript file.                               |
| `format` | `string` | Required | Transcript format understood by the owning conversation store.         |

## Signature

```ts
export interface ConversationRecord {
  readonly id: string;
  readonly file: string;
  readonly format: string;
}
```
