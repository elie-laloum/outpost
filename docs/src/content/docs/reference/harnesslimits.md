---
title: "HarnessLimits"
description: "HarnessLimits — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessLimits } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                 | Type                                            | Presence | Meaning                                                                                                                                                                                                                                                            |
| -------------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `maxSteps`           | `number \| undefined`                           | Optional | Maximum number of model requests in one turn; defaults to 100.                                                                                                                                                                                                     |
| `maxDelegationDepth` | `number \| undefined`                           | Optional | Maximum additional levels of child delegation from this harness; defaults to 3, accepts 0 to disable delegation and cannot raise an ancestor limit.                                                                                                                |
| `maxToolCalls`       | `number \| undefined`                           | Optional | Maximum number of tool calls in one turn; unbounded apart from maxSteps when omitted.                                                                                                                                                                              |
| `usage`              | `Partial<Omit<Usage, "complete">> \| undefined` | Optional | Observed token ceilings per turn, including context summaries and all descendants. Checked after each complete response and before another request; exceeding a ceiling fails even on the final answer. Missing or partial usage rejects token-budgeted execution. |

## Signature

```ts
export interface HarnessLimits {
  readonly maxSteps?: number;
  readonly maxDelegationDepth?: number;
  readonly maxToolCalls?: number;
  readonly usage?: Partial<Omit<Usage, "complete">>;
}
```

## Related contracts

- [Usage](../usage/)
