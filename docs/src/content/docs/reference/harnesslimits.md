---
title: "HarnessLimits"
description: "HarnessLimits — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. The contract may change before release.
:::

## Import

```ts
import type { HarnessLimits } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                          | Presence | Meaning                                                                                                                                                               |
| -------------- | ----------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maxSteps`     | `number \| undefined`         | Optional | Maximum number of model requests in one turn; defaults to 100.                                                                                                        |
| `maxToolCalls` | `number \| undefined`         | Optional | Maximum number of tool calls in one turn; unbounded apart from maxSteps when omitted.                                                                                 |
| `usage`        | `Partial<Usage> \| undefined` | Optional | Token budget per counter (input, cached, cacheCreated, output), checked before each new request. Requires a provider that reports usage; the last step may exceed it. |

## Signature

```ts
export interface HarnessLimits {
  readonly maxSteps?: number;
  readonly maxToolCalls?: number;
  readonly usage?: Partial<Usage>;
}
```

## Related contracts

- [Usage](../usage/)
