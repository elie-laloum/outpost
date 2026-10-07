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

| Name          | Type                              | Presence | Meaning                                                                                                                                                                                                           |
| ------------- | --------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transporter` | `Transport`                       | Required | Transport you own that stores the race under speculations/&lt;sha256 of runId>.json with conditional writes, up to 16 MiB. createLocalTransport() under .outpost/storage is the usual choice.                     |
| `runId`       | `string`                          | Required | Stable nonempty name of the race. One coordinator owns it at a time; another speculate() call on it rejects until the owner returns or is recovered.                                                              |
| `version`     | `string`                          | Required | Nonempty version of your agents, validation, scoring and settings. With the repository, provider, candidate keys, briefs, budget and selection mode, it must match the saved race; otherwise speculate() rejects. |
| `resume`      | `"retry-incomplete" \| undefined` | Optional | retry-incomplete replays candidates interrupted while running, with their side effects, as new attempts. Without it, a race with interrupted candidates rejects.                                                  |

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
