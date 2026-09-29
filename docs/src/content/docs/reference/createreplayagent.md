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

Create a single-use agent that replays one dispatch journal without calling a model. Each turn compares the rendered prompt, re-emits the recorded events and usage, and the last turn of each sandbox dispatch rebuilds the recorded commits with their original identities. A divergence throws ReplayDivergence (a warning for some kinds with divergence: "warn"); a malformed journal throws code configuration, and a replay agent cannot be steered.

[Complete example and detailed rules](../../guide/record-replay/).

## Parameters and properties

| Name                 | Type                                  | Presence | Meaning                                                                                                                                                                               |
| -------------------- | ------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`            | `ReplayAgentOptions`                  | Required | Journal to replay and divergence policy.                                                                                                                                              |
| `options.journal`    | `readonly unknown[]`                  | Required | Entries returned by readJournal for one dispatch. Record with logging.replayable to include workspace commits.                                                                        |
| `options.divergence` | `ReplayDivergencePolicy \| undefined` | Optional | Divergence policy, default fail. warn continues after prompt, baseline, tree and unrecorded divergences, but still throws when a patch cannot be applied or the journal is exhausted. |

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
