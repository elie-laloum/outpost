---
title: "ConversationLocation"
description: "ConversationLocation — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ConversationLocation } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type                 | Presence | Meaning                                                                |
| -------- | -------------------- | -------- | ---------------------------------------------------------------------- |
| `id`     | `string`             | Required | Native conversation identifier used to locate or continue the session. |
| `file`   | `string`             | Required | Host path of the native transcript file.                               |
| `format` | `ConversationFormat` | Required | Native transcript layout: claude or codex.                             |

## Signature

```ts
export interface ConversationLocation {
  readonly id: string;
  readonly file: string;
  readonly format: ConversationFormat;
}
```

## Related contracts

- [ConversationFormat](../conversationformat/)
