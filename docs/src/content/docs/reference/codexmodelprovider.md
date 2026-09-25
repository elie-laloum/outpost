---
title: "CodexModelProvider"
description: "CodexModelProvider — Outpost API"
sidebar:
  order: 10
---

Public contract for **CodexModelProvider**. See the [agents guide](../../guide/agents/adapters/) for behavior, defaults and examples.

## Import

```ts
import type { CodexModelProvider } from "@elie-laloum/outpost";
```

## Purpose and behavior

Configure native Claude Code, Codex or Gemini behavior independently of the sandbox backend.

The installed CLI chooses its model when omitted. Native conversation capture defaults on for Claude/Codex. Gemini supports fresh sessions only. Account and provider credentials are separate.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Parameters and properties

| Name                | Type                           | Presence | Meaning                                                                 |
| ------------------- | ------------------------------ | -------- | ----------------------------------------------------------------------- |
| `baseUrl`           | `string`                       | Required | See the linked contract and this family's rules for its interpretation. |
| `apiKeyEnvironment` | `string \| false \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface CodexModelProvider {
  readonly baseUrl: string;
  readonly apiKeyEnvironment?: string | false;
}
```
