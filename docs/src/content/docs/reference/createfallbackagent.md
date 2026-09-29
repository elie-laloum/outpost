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

Compose an ordered FallbackAgent from at least two agents and an explicit on list. Dispatch runs the candidates in order in the same sandbox and workspace, preparing each only when it is tried, and moves on only after a quota or unavailable failure listed in on; other failures are rethrown. Construction validates and freezes the list without starting anything.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Parameters and properties

| Name         | Type                                  | Presence | Meaning                                                                                                              |
| ------------ | ------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `agents`     | `readonly [Agent, Agent, ...Agent[]]` | Required | Ordered candidates, at least two, each composed with createAgent() or createReplayAgent(); the first is tried first. |
| `options`    | `FallbackAgentOptions`                | Required | Fallback policy; on is required.                                                                                     |
| `options.on` | `readonly FallbackTrigger[]`          | Required | Failure categories that move to the next candidate: quota, unavailable or both, without repetition.                  |

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
