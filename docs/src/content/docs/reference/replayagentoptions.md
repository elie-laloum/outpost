---
title: "ReplayAgentOptions"
description: "ReplayAgentOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ReplayAgentOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                                  | Presence | Meaning                                                                                                                                                                               |
| ------------ | ------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `journal`    | `readonly unknown[]`                  | Required | Entries returned by readJournal for one dispatch. Record with logging.replayable to include workspace commits.                                                                        |
| `divergence` | `ReplayDivergencePolicy \| undefined` | Optional | Divergence policy, default fail. warn continues after prompt, baseline, tree and unrecorded divergences, but still throws when a patch cannot be applied or the journal is exhausted. |

## Signature

```ts
export interface ReplayAgentOptions {
  readonly journal: readonly unknown[];
  readonly divergence?: ReplayDivergencePolicy;
}
```

## Related contracts

- [ReplayDivergencePolicy](../replaydivergencepolicy/)
