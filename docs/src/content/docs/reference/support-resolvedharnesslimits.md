---
title: "ResolvedHarnessLimits"
description: "ResolvedHarnessLimits — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name                 | Type                                            | Presence | Meaning                                                                                                                                                                                                   |
| -------------------- | ----------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maxSteps`           | `number`                                        | Required | Effective maximum number of model requests per turn after defaults.                                                                                                                                       |
| `maxDelegationDepth` | `number \| undefined`                           | Optional | Levels of subagent delegation allowed below this harness, default 3; 0 disables delegation. A child cannot raise an ancestor's limit, and a delegation past it fails with code limit, handled by onError. |
| `maxToolCalls`       | `number \| undefined`                           | Optional | Configured maximum number of tool calls per turn, when set.                                                                                                                                               |
| `usage`              | `Partial<Omit<Usage, "complete">> \| undefined` | Optional | Configured token budget per usage counter, when set.                                                                                                                                                      |

## Signature

```ts
export interface ResolvedHarnessLimits extends HarnessLimits {
  readonly maxSteps: number;
}
```

## Related contracts

- [HarnessLimits](../harnesslimits/)
