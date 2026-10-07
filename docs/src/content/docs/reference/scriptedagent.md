---
title: "scriptedAgent"
description: "scriptedAgent — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { scriptedAgent } from "@elie-laloum/outpost/testing";
```

## Purpose and behavior

Create a CLI-shaped test agent that consumes a snapshot of turns in declaration order, including retries, passes and response repairs. It emits predefined events and complete zero usage by default; turns exhausted throws code process. Use createMemorySandboxProvider explicitly. Conversation IDs support repairs and resume only in the same open sandbox; capture, cold resume, fork, terminals and live input are unavailable. Each independent test needs a fresh agent.

[Complete example and detailed rules](../../guide/testing-workflows/).

## Parameters and properties

| Name            | Type                      | Presence | Meaning                                                                                                                           |
| --------------- | ------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `options`       | `ScriptedAgentOptions`    | Required | Snapshot of the name and ordered turns for one test agent. No sandbox is allocated until dispatch or createSandbox.               |
| `options.name`  | `string \| undefined`     | Optional | Observer-visible agent name; defaults to scripted. Empty names are rejected.                                                      |
| `options.turns` | `readonly ScriptedTurn[]` | Required | Nonempty sequence consumed once per agent request, across sandboxes, passes, retries and repairs. Recreate the agent to reset it. |

## Returns

`CliAgent`

## Signature

```ts
export declare function scriptedAgent(options: ScriptedAgentOptions): CliAgent;
```

## Related contracts

- [CliAgent](../cliagent/)
- [ScriptedAgentOptions](../scriptedagentoptions/)
