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

| Name        | Type                              | Presence | Meaning                                                                                                                                                 |
| ----------- | --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`        | `string`                          | Required | Native conversation identifier used to locate or continue the session.                                                                                  |
| `file`      | `string`                          | Required | Host path of the captured transcript or session bundle.                                                                                                 |
| `reference` | `TransportReference \| undefined` | Optional | Transport key and revision of the conversation index, set by createTransportConversations(). file still points to a readable local copy.                |
| `format`    | `string`                          | Required | Format of the store that produced the record. Transcript and session bundle stores reject restoring a record of another format with code configuration. |

## Signature

```ts
export interface ConversationRecord {
  readonly id: string;
  readonly file: string;
  readonly reference?: TransportReference;
  readonly format: string;
}
```

## Related contracts

- [TransportReference](../transportreference/)
