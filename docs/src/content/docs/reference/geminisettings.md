---
title: "GeminiSettings"
description: "GeminiSettings — Outpost API"
sidebar:
  order: 10
---

Public contract for **GeminiSettings**. See the [agents guide](../../guide/agents/adapters/) for behavior, defaults and examples.

## Import

```ts
import type { GeminiSettings } from "@elie-laloum/outpost";
```

## Purpose and behavior

Configure native Claude Code, Codex or Gemini behavior independently of the sandbox backend.

The installed CLI chooses its model when omitted. Native conversation capture defaults on for Claude/Codex. Gemini supports fresh sessions only. Account and provider credentials are separate.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Parameters and properties

| Name           | Type                                                        | Presence | Meaning                                                                 |
| -------------- | ----------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `model`        | `string \| undefined`                                       | Optional | Native CLI model identifier; availability depends on the account.       |
| `variables`    | `Readonly<Record<string, string>> \| undefined`             | Optional | Explicit environment declarations; values are strings.                  |
| `approvalMode` | `"default" \| "plan" \| "auto_edit" \| "yolo" \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface GeminiSettings {
  readonly model?: string;
  readonly variables?: Variables;
  readonly approvalMode?: "default" | "auto_edit" | "yolo" | "plan";
}
```

## Related contracts

- [Variables](../variables/)
