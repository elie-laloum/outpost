---
title: "TriggerSource"
description: "TriggerSource — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TriggerSource } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type                                                                     | Presence | Meaning                                                                                      |
| -------- | ------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------- |
| `name`   | `string`                                                                 | Required | Source name reported in TriggerEvent.source.                                                 |
| `verify` | `(request: TriggerHttpRequest, now: number) => Promise<TriggerEvent>`    | Required | Authenticate the request and return the normalized event; throwing rejects it with 401.      |
| `reply`  | `((outcome: TriggerOutcome, job?: string) => TriggerReply) \| undefined` | Optional | Replace the default 202 and 204 replies for senders expecting another status, such as Slack. |

## Signature

```ts
export interface TriggerSource {
  readonly name: string;
  verify(request: TriggerHttpRequest, now: number): Promise<TriggerEvent>;
  /** Overrides the default 202/204 replies when the sender expects another status. */
  reply?(outcome: TriggerOutcome, job?: string): TriggerReply;
}
```

## Related contracts

- [TriggerEvent](../triggerevent/)
- [TriggerHttpRequest](../triggerhttprequest/)
- [TriggerOutcome](../triggeroutcome/)
- [TriggerReply](../triggerreply/)
