---
title: "createReplayAgent"
description: "createReplayAgent — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createReplayAgent } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a single-use agent that replays one dispatch journal without calling a model. Each turn checks the rendered prompt, re-emits the recorded events and usage, and the last turn of each sandbox dispatch rebuilds the recorded commits inside the sandbox with their original identities, so an identical baseline yields identical commit IDs. Divergences raise ReplayDivergence or, with divergence: "warn", warnings. Replays cannot be resumed or forked.

[Complete example and detailed rules](../../guide/record-replay/).

## Parameters and properties

| Name                 | Type                                  | Presence | Meaning                                                                                                                                                                     |
| -------------------- | ------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`            | `ReplayAgentOptions`                  | Required | Journal to replay and divergence policy.                                                                                                                                    |
| `options.journal`    | `readonly unknown[]`                  | Required | Entries returned by readJournal for one dispatch. Record with logging.replayable to include workspace commits.                                                              |
| `options.divergence` | `ReplayDivergencePolicy \| undefined` | Optional | Divergence policy; defaults to fail. warn continues after prompt, baseline and tree differences but still fails when a patch cannot be applied or the journal is exhausted. |

## Returns

`ReplayAgent`

## Signature

```ts
export declare function createReplayAgent(
  options: ReplayAgentOptions,
): ReplayAgent;
```

## Related contracts

- [ReplayAgent](../type-replayagent/)
- [ReplayAgentOptions](../replayagentoptions/)
