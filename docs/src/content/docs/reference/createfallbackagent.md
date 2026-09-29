---
title: "createFallbackAgent"
description: "createFallbackAgent — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createFallbackAgent } from "@elie-laloum/outpost";
```

## Purpose and behavior

Order at least two agents into a frozen FallbackAgent that dispatch runs in one sandbox and workspace, without reset. A candidate hands over only on a quota or outage fault listed in on, and the next one restarts from the original brief; every other failure is rethrown. Fewer than two candidates, a nested fallback agent or an invalid on list throws code configuration.

[Complete example and detailed rules](../../guide/fallback-agents/).

## Parameters and properties

| Name         | Type                                  | Presence | Meaning                                                                                                                                        |
| ------------ | ------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `agents`     | `readonly [Agent, Agent, ...Agent[]]` | Required | Ordered candidates, at least two, each composed with createAgent() or createReplayAgent(); the first is tried first.                           |
| `options`    | `FallbackAgentOptions`                | Required | Fallback policy: the on list of failure categories.                                                                                            |
| `options.on` | `readonly FallbackTrigger[]`          | Required | Failure categories that move to the next candidate: quota, unavailable or both. An empty, repeated or unknown entry throws code configuration. |

## Returns

`FallbackAgent`

## Signature

```ts
export declare function createFallbackAgent(
  agents: readonly [Agent, Agent, ...Agent[]],
  options: FallbackAgentOptions,
): FallbackAgent;
```

## Related contracts

- [Agent](../type-agent/)
- [FallbackAgent](../type-fallbackagent/)
- [FallbackAgentOptions](../fallbackagentoptions/)
