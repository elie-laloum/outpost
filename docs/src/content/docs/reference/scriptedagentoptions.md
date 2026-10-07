---
title: "ScriptedAgentOptions"
description: "ScriptedAgentOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ScriptedAgentOptions } from "@elie-laloum/outpost/testing";
```

## Parameters and properties

| Name    | Type                      | Presence | Meaning                                                                                                                           |
| ------- | ------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `name`  | `string \| undefined`     | Optional | Observer-visible agent name; defaults to scripted. Empty names are rejected.                                                      |
| `turns` | `readonly ScriptedTurn[]` | Required | Nonempty sequence consumed once per agent request, across sandboxes, passes, retries and repairs. Recreate the agent to reset it. |

## Signature

```ts
export interface ScriptedAgentOptions {
  readonly name?: string;
  readonly turns: readonly ScriptedTurn[];
}
```

## Related contracts

- [ScriptedTurn](../scriptedturn/)
