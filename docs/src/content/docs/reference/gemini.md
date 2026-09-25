---
title: "gemini"
description: "gemini — Outpost API"
sidebar:
  order: 10
---

Public contract for **gemini**. See the [agents guide](../../guide/agents/adapters/) for behavior, defaults and examples.

## Import

```ts
import { gemini } from "@elie-laloum/outpost";
```

## Purpose and behavior

Configure native Claude Code, Codex or Gemini behavior independently of the sandbox backend.

The installed CLI chooses its model when omitted. Native conversation capture defaults on for Claude/Codex. Gemini supports fresh sessions only. Account and provider credentials are separate.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Parameters and properties

| Name       | Type                          | Presence | Meaning                                                                 |
| ---------- | ----------------------------- | -------- | ----------------------------------------------------------------------- |
| `settings` | `GeminiSettings \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |

## Returns

`AgentAdapter`

## Signature

```ts
export declare function gemini(settings?: GeminiSettings): AgentAdapter;
```

## Related contracts

- [AgentAdapter](../agentadapter/)
- [GeminiSettings](../geminisettings/)
