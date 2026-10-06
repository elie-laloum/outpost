---
title: "HarnessModelRoutingContext"
description: "HarnessModelRoutingContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessModelRoutingContext } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                       | Presence | Meaning                                                                                                                |
| ---------- | -------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `system`   | `string`                   | Required | Session instructions already resolved once for the run.                                                                |
| `messages` | `readonly ModelMessage[]`  | Required | Current post-compaction messages; custom state builders must explicitly exclude any opaque reasoning they do not need. |
| `tools`    | `readonly ModelToolSpec[]` | Required | Available model-facing tool declarations for this step.                                                                |
| `step`     | `number`                   | Required | One-based harness step about to request a conversational model.                                                        |
| `model`    | `AgentModel`               | Required | Active effective model before the new selection, also used by preceding compaction.                                    |
| `signal`   | `AbortSignal`              | Required | Run cancellation signal; state callbacks and providers should honor it.                                                |

## Signature

```ts
export interface HarnessModelRoutingContext {
  readonly system: string;
  readonly messages: readonly ModelMessage[];
  readonly tools: readonly ModelToolSpec[];
  readonly step: number;
  readonly model: AgentModel;
  readonly signal: AbortSignal;
}
```

## Related contracts

- [AgentModel](../agentmodel/)
- [ModelMessage](../modelmessage/)
- [ModelToolSpec](../modeltoolspec/)
