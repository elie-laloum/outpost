---
title: "AgentInput"
description: "AgentInput — Outpost API"
sidebar:
  order: 10
---

Public contract for **AgentInput**. See the [agents guide](../../guide/agents/adapters/) for behavior, defaults and examples.

## Import

```ts
import type { AgentInput } from "@elie-laloum/outpost";
```

## Purpose and behavior

Configure native Claude Code, Codex or Gemini behavior independently of the sandbox backend.

The installed CLI chooses its model when omitted. Native conversation capture defaults on for Claude/Codex. Gemini supports fresh sessions only. Account and provider credentials are separate.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Parameters and properties

| Name           | Type                                                             | Presence | Meaning                                                                 |
| -------------- | ---------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `text`         | `string \| undefined`                                            | Optional | Text content; see the owning operation for its source.                  |
| `interactive`  | `boolean \| undefined`                                           | Optional | See the linked contract and this family's rules for its interpretation. |
| `continuation` | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface AgentInput {
  readonly text?: string;
  readonly interactive?: boolean;
  readonly continuation?: {
    readonly id: string;
    readonly fork?: boolean;
  };
}
```
