---
title: "FallbackEvent"
description: "FallbackEvent — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

| Name         | Type                  | Presence | Meaning                                                                                                                                                                                                                                        |
| ------------ | --------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`       | `"fallback"`          | Required | Discriminator selecting the event payload: phase, summary, warning, text, text-delta, result, prompt, tool, tool-result, tool-denied, step, stop-prevented, steer, compaction, conversation, usage, quota, fallback, failure, finished or raw. |
| `from`       | `FallbackCandidate`   | Required | Candidate that stopped in a fallback event: its position, adapter name and model name when one was selected.                                                                                                                                   |
| `to`         | `FallbackCandidate`   | Required | Candidate that takes over in a fallback event: its position, adapter name and model name when one was selected.                                                                                                                                |
| `failure`    | `FallbackTrigger`     | Required | Category that ended the previous candidate in a fallback event: quota or unavailable.                                                                                                                                                          |
| `message`    | `string`              | Required | Warning, failure or quota message, the failure that triggered a fallback, or the message a stop hook sent back to the model.                                                                                                                   |
| `resetAt`    | `string \| undefined` | Optional | ISO timestamp at which a quota or fallback event says the usage or rate limit resets; present only when reported in structured form.                                                                                                           |
| `subagentId` | `string \| undefined` | Optional | Identifier of the built-in child that emitted the event; absent for the root harness. Lifecycle events link that identifier to the delegating tool call.                                                                                       |

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
