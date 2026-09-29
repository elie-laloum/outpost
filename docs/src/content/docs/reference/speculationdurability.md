---
title: "SpeculationDurability"
description: "SpeculationDurability — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Part of the experimental speculation API: this contract can still change. See [Competing candidates](../../guide/speculation/).
:::

## Import

```ts
import type { SpeculationDurability } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                              | Presence | Meaning                                                                                                                                                                |
| ------------- | --------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transporter` | `Transport`                       | Required | Caller-owned transport storing conditional speculation checkpoints; choose createLocalTransport under the repository .outpost/storage or an explicit remote transport. |
| `runId`       | `string`                          | Required | Stable nonempty identifier used to locate and exclusively own this race across calls.                                                                                  |
| `version`     | `string`                          | Required | Nonempty implementation/input version; change it when agents, validation, provider configuration or other semantics change. Incompatible resumes are rejected.         |
| `resume`      | `"retry-incomplete" \| undefined` | Optional | Explicit retry-incomplete authorization to replay interrupted candidates and their possible side effects. Completed candidates are retained.                           |

## Signature

```ts
export interface SpeculationDurability {
  readonly transporter: Transport;
  readonly runId: string;
  readonly version: string;
  readonly resume?: "retry-incomplete";
}
```

## Related contracts

- [Transport](../transport/)
