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

| Name         | Type                           | Presence          | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------ | ------------------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`       | `"warning" \| "text" \| "raw"` | Required          | Event type selecting the payload: phase, summary, warning, text, text-delta, result, prompt, tool, tool-result, tool-output, tool-denied, file-change, reasoning, step, hook, instructions-loaded, skills-loaded, model-request, model-response, model-retry, model-error, stop-prevented, steer, compaction, subagent, conversation, usage, message-usage, quota, fallback, stderr, stopped, failure, finished or raw. |
| `message`    | `string`                       | Variant-dependent | Message of a warning, failure, quota, fallback, model-retry or model-error event, or the message a stop hook sent back to the model on stop-prevented.                                                                                                                                                                                                                                                                  |
| `subagentId` | `string \| undefined`          | Optional          | Identifier of the built-in child that emitted the event; absent for the root harness. Lifecycle events link that identifier to the delegating tool call.                                                                                                                                                                                                                                                                |
| `text`       | `string`                       | Variant-dependent | Text of the event according to kind: agent text, streamed fragment, final answer, rendered prompt, steering instruction, reasoning, stderr line or tool output chunk.                                                                                                                                                                                                                                                   |
| `value`      | `unknown`                      | Variant-dependent | Raw protocol line as the agent printed it; for an oversized line, only its first 2000 characters.                                                                                                                                                                                                                                                                                                                       |
| `bytes`      | `number \| undefined`          | Variant-dependent | Observed UTF-8 byte size of an oversized protocol line or buffered prefix before termination.                                                                                                                                                                                                                                                                                                                           |
| `truncated`  | `boolean \| undefined`         | Variant-dependent | Whether the stderr fragment or oversized raw preview was bounded before delivery.                                                                                                                                                                                                                                                                                                                                       |

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
