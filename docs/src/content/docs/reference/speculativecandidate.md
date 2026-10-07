---
title: "SpeculativeCandidate"
description: "SpeculativeCandidate — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Part of the experimental speculation API: this contract can still change. See [Competing candidates](../../guide/speculation/).
:::

## Import

```ts
import type { SpeculativeCandidate } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                                              | Presence | Meaning                                                                                                                                                                                                                                   |
| --------- | ----------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`     | `string`                                                          | Required | Unique name of 1 to 64 letters, digits, _ or -, starting with a letter or digit. It appears in the candidate's branch name.                                                                                                               |
| `agent`   | `DispatchAgent`                                                   | Required | Agent that runs the candidate: one from createAgent() or createReplayAgent(), or a createFallbackAgent(). A quota fault that reaches the race, including one the fallback agent does not absorb, settles the candidate with status quota. |
| `request` | `Omit<DispatchOptions<T>, "agent" \| "signal" \| "continuation">` | Required | Dispatch options for this candidate, such as brief and response. The race supplies agent and signal; continuation is not accepted.                                                                                                        |

## Signature

```ts
export interface SpeculativeCandidate<T = undefined> {
  readonly key: string;
  readonly agent: DispatchAgent;
  readonly request: Omit<
    DispatchOptions<T>,
    "agent" | "signal" | "continuation"
  >;
}
```

## Related contracts

- [DispatchAgent](../dispatchagent/)
- [DispatchOptions](../dispatchoptions/)
