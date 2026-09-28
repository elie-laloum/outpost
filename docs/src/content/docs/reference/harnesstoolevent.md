---
title: "HarnessToolEvent"
description: "HarnessToolEvent — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { HarnessToolEvent } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name         | Type                           | Presence          | Meaning                                                                                                                                                                                                                       |
| ------------ | ------------------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`       | `"warning" \| "text" \| "raw"` | Required          | Discriminator selecting the event payload: phase, summary, warning, text, text-delta, result, prompt, tool, tool-result, tool-denied, step, stop-prevented, compaction, conversation, usage, quota, failure, finished or raw. |
| `message`    | `string`                       | Variant-dependent | Warning, failure or quota message, or the message a stop hook sent back to the model.                                                                                                                                         |
| `subagentId` | `string \| undefined`          | Optional          | Identifier of the built-in child that emitted the event; absent for the root harness. Lifecycle events link that identifier to the delegating tool call.                                                                      |
| `text`       | `string`                       | Variant-dependent | Text carried by the event: a streamed fragment, streamed text, final answer or submitted prompt according to kind.                                                                                                            |
| `value`      | `unknown`                      | Variant-dependent | Unrecognized raw protocol value preserved for observation.                                                                                                                                                                    |
| `bytes`      | `number \| undefined`          | Variant-dependent | Observed UTF-8 byte size of an oversized protocol line or buffered prefix before termination.                                                                                                                                 |
| `truncated`  | `boolean \| undefined`         | Variant-dependent | Whether the stderr fragment or oversized raw preview was bounded before delivery.                                                                                                                                             |

## Signature

```ts
export type HarnessToolEvent = Extract<
  AgentEvent,
  {
    readonly kind: "text" | "warning" | "raw";
  }
>;
```

## Related contracts

- [AgentEvent](../agentevent/)
