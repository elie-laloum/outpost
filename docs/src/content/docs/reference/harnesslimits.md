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

| Name                 | Type                                            | Presence | Meaning                                                                                                                                                                                                                                                                                                 |
| -------------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maxSteps`           | `number \| undefined`                           | Optional | Maximum model requests per turn, default 100. Reaching it without a final answer fails the turn with code limit; summary requests do not count.                                                                                                                                                         |
| `maxDelegationDepth` | `number \| undefined`                           | Optional | Levels of subagent delegation allowed below this harness, default 3; 0 disables delegation. A child cannot raise an ancestor's limit, and a delegation past it fails with code limit, handled by onError.                                                                                               |
| `maxToolCalls`       | `number \| undefined`                           | Optional | Maximum tool calls per turn, unbounded by default. Exceeding it fails the turn with code limit.                                                                                                                                                                                                         |
| `usage`              | `Partial<Omit<Usage, "complete">> \| undefined` | Optional | Token ceilings per turn for input, cached, cacheCreated and output, counting context summaries and all subagents. Checked after each response; exceeding one fails the turn with code limit, even on the final answer. A provider that reports no usage or partial usage fails with code configuration. |

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
