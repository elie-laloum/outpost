---
title: "TriggerReply"
description: "TriggerReply — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerReply } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                  | Presence | Meaning                                              |
| ------------- | --------------------- | -------- | ---------------------------------------------------- |
| `status`      | `number`              | Required | HTTP status returned to the sender.                  |
| `body`        | `string \| undefined` | Optional | Response body text; the reply is empty when omitted. |
| `contentType` | `string \| undefined` | Optional | Content type of the body, when one is sent.          |

## Signature

```ts
export interface TriggerReply {
  readonly status: number;
  readonly body?: string;
  readonly contentType?: string;
}
```
