---
title: "FallbackEvent"
description: "FallbackEvent — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

| Name         | Type                  | Presence | Meaning                                                                                                                                                  |
| ------------ | --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`       | `"fallback"`          | Required | Always fallback: a failed agent candidate hands execution to the next explicitly configured candidate.                                                   |
| `from`       | `FallbackCandidate`   | Required | Candidate that stopped in a fallback event: its position, adapter name and model name when one was selected.                                             |
| `to`         | `FallbackCandidate`   | Required | Candidate that takes over in a fallback event: its position, adapter name and model name when one was selected.                                          |
| `failure`    | `FallbackTrigger`     | Required | Category that ended the previous candidate in a fallback event: quota or unavailable.                                                                    |
| `message`    | `string`              | Required | Message of a warning, failure, quota, fallback, model-retry or model-error event, or the message a stop hook sent back to the model on stop-prevented.   |
| `resetAt`    | `string \| undefined` | Optional | ISO timestamp at which a quota or fallback event says the usage or rate limit resets; present only when reported in structured form.                     |
| `subagentId` | `string \| undefined` | Optional | Identifier of the built-in child that emitted the event; absent for the root harness. Lifecycle events link that identifier to the delegating tool call. |

## Signature

```ts
export type FallbackEvent = Extract<
  AgentEvent,
  {
    readonly kind: "fallback";
  }
>;
```

## Related contracts

- [AgentEvent](../agentevent/)
