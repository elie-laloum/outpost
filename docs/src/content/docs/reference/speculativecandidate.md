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

| Name      | Type                                                              | Presence | Meaning                                                                                                                                                                                                                                                         |
| --------- | ----------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`     | `string`                                                          | Required | Unique candidate key used to correlate its branch, validation and final result.                                                                                                                                                                                 |
| `agent`   | `DispatchAgent`                                                   | Required | Agent that runs the dispatch: a single agent composed with agent() or replayAgent(), or a fallbackAgent() whose candidates are tried in order on listed quota or outage failures. The candidate settles with status quota only when every fallback hit a limit. |
| `request` | `Omit<DispatchOptions<T>, "signal" \| "agent" \| "continuation">` | Required | Candidate-specific brief and response settings; the race controls agent, cancellation and fresh-session behavior.                                                                                                                                               |

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
