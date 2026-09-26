---
title: "ResolvedHarnessLimits"
description: "ResolvedHarnessLimits — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name           | Type                          | Presence | Meaning                                                             |
| -------------- | ----------------------------- | -------- | ------------------------------------------------------------------- |
| `maxSteps`     | `number`                      | Required | Effective maximum number of model requests per turn after defaults. |
| `maxToolCalls` | `number \| undefined`         | Optional | Configured maximum number of tool calls per turn, when set.         |
| `usage`        | `Partial<Usage> \| undefined` | Optional | Configured token budget per usage counter, when set.                |

## Signature

```ts
export interface ResolvedHarnessLimits extends HarnessLimits {
  readonly maxSteps: number;
}
```

## Related contracts

- [HarnessLimits](../harnesslimits/)
