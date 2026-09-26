---
title: "HarnessContextInput"
description: "HarnessContextInput — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Skills and streaming are not available yet; the contract may change before release.
:::

## Import

```ts
import type { HarnessContextInput } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                                                     | Presence | Meaning                                                                                           |
| ----------- | -------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `messages`  | `readonly ModelMessage[]`                                | Required | Current effective history about to be sent.                                                       |
| `step`      | `number`                                                 | Required | Current step number.                                                                              |
| `model`     | `AgentModel`                                             | Required | Normalized model of the agent.                                                                    |
| `signal`    | `AbortSignal`                                            | Required | Turn cancellation signal.                                                                         |
| `summarize` | `(messages: readonly ModelMessage[]) => Promise<string>` | Required | Ask the agent model for a factual summary of the given messages; the request counts toward usage. |

## Signature

```ts
export interface HarnessContextInput {
  readonly messages: readonly ModelMessage[];
  readonly step: number;
  readonly model: AgentModel;
  readonly signal: AbortSignal;
  summarize(messages: readonly ModelMessage[]): Promise<string>;
}
```

## Related contracts

- [AgentModel](../agentmodel/)
- [ModelMessage](../modelmessage/)
