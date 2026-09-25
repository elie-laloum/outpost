---
title: "gemini"
description: "gemini — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { gemini } from "@elie-laloum/outpost";
```

## Purpose and behavior

Build the Gemini CLI adapter for a fresh session. It decodes text, tool and usage events but does not offer native transcript capture, resume, fork or automatic response repairs. Model and approval settings configure the CLI invocation.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Parameters and properties

| Name                    | Type                                                        | Presence | Meaning                                                           |
| ----------------------- | ----------------------------------------------------------- | -------- | ----------------------------------------------------------------- |
| `settings`              | `GeminiSettings \| undefined`                               | Optional | Gemini model, approval mode and explicit environment settings.    |
| `settings.model`        | `string \| undefined`                                       | Optional | Native CLI model identifier; availability depends on the account. |
| `settings.variables`    | `Readonly<Record<string, string>> \| undefined`             | Optional | Explicit environment declarations; values are strings.            |
| `settings.approvalMode` | `"default" \| "plan" \| "auto_edit" \| "yolo" \| undefined` | Optional | Gemini CLI tool-approval mode.                                    |

## Returns

`AgentAdapter`

## Signature

```ts
export declare function gemini(settings?: GeminiSettings): AgentAdapter;
```

## Related contracts

- [AgentAdapter](../agentadapter/)
- [GeminiSettings](../geminisettings/)
