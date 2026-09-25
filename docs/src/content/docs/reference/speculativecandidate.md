---
title: "SpeculativeCandidate"
description: "SpeculativeCandidate — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SpeculativeCandidate } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                                              | Presence | Meaning                                                                                                           |
| --------- | ----------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `key`     | `string`                                                          | Required | Unique candidate key used to correlate its branch, validation and final result.                                   |
| `agent`   | `Agent`                                                           | Required | Native coding-agent adapter.                                                                                      |
| `request` | `Omit<DispatchOptions<T>, "signal" \| "agent" \| "continuation">` | Required | Candidate-specific brief and response settings; the race controls agent, cancellation and fresh-session behavior. |

## Signature

```ts
export interface SpeculativeCandidate<T = undefined> {
  readonly key: string;
  readonly agent: Agent;
  readonly request: Omit<
    DispatchOptions<T>,
    "agent" | "signal" | "continuation"
  >;
}
```

## Related contracts

- [Agent](../type-agent/)
- [DispatchOptions](../dispatchoptions/)
