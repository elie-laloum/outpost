---
title: "HarnessToolEvent"
description: "HarnessToolEvent — Outpost API"
sidebar:
  order: 10
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Skills and streaming are not available yet; the contract may change before release.
:::

## Import

```ts
import type { HarnessToolEvent } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name      | Type                           | Presence          | Meaning                                                                                                                                                                                                    |
| --------- | ------------------------------ | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`    | `"warning" \| "text" \| "raw"` | Required          | Discriminator selecting the event payload: phase, summary, warning, text, result, prompt, tool, tool-result, tool-denied, step, stop-prevented, compaction, conversation, usage, failure, finished or raw. |
| `message` | `string`                       | Variant-dependent | Warning or failure message, or the message a stop hook sent back to the model.                                                                                                                             |
| `text`    | `string`                       | Variant-dependent | Text carried by the event: streamed text, final answer or submitted prompt according to kind.                                                                                                              |
| `value`   | `unknown`                      | Variant-dependent | Unrecognized raw protocol value preserved for observation.                                                                                                                                                 |

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
