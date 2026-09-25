---
title: "CustomHarness"
description: "CustomHarness — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CustomHarness } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type            | Presence | Meaning                                                                                                                                  |
| --------------- | --------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`          | `"custom"`      | Required | Execution discriminator: custom.                                                                                                         |
| `modelProvider` | `ModelProvider` | Required | Reusable request transport used by the execution callback; no model catalog is imposed.                                                  |
| `run`           | `HarnessRun`    | Required | Caller implementation returning text and optional usage. It must cooperate with cancellation and await its sandbox and model operations. |

## Signature

```ts
export interface CustomHarness {
  readonly kind: "custom";
  readonly modelProvider: ModelProvider;
  readonly run: HarnessRun;
}
```

## Related contracts

- [HarnessRun](../harnessrun/)
- [ModelProvider](../modelprovider/)
