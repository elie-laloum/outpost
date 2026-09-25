---
title: "ModelResult"
description: "ModelResult — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
This first phase makes text-only HTTP calls without Codex. The agent harness is planned for phase two: tool execution, repository editing and conversation persistence are not implemented. This API cannot be used as a dispatch agent or sandbox provider; its contract may change. See the [implemented scope and planned harness](../../guide/advanced/model-providers/).
:::

## Import

```ts
import type { ModelResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name    | Type                 | Presence | Meaning                                                                                                                                                                                      |
| ------- | -------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`  | `string`             | Required | Complete assistant text, preserving whitespace; Responses output_text parts are concatenated in order. Incomplete or unsupported outputs reject instead of returning partial success.        |
| `usage` | `Usage \| undefined` | Optional | Token counts reported by the service, when present. Missing usage stays absent; missing cached-token details become zero. This is not a billing estimate or automatic workflow usage report. |

## Signature

```ts
export interface ModelResult {
  readonly text: string;
  readonly usage?: Usage;
}
```

## Related contracts

- [Usage](../usage/)
