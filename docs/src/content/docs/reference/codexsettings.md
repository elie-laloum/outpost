---
title: "CodexSettings"
description: "CodexSettings — Outpost API"
sidebar:
  order: 10
---

Public contract for **CodexSettings**. See the [agents guide](../../guide/agents/adapters/) for behavior, defaults and examples.

## Import

```ts
import type { CodexSettings } from "@elie-laloum/outpost";
```

## Purpose and behavior

Configure native Claude Code, Codex or Gemini behavior independently of the sandbox backend.

The installed CLI chooses its model when omitted. Native conversation capture defaults on for Claude/Codex. Gemini supports fresh sessions only. Account and provider credentials are separate.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Parameters and properties

| Name                | Type                                                  | Presence | Meaning                                                                 |
| ------------------- | ----------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `modelProvider`     | `CodexModelProvider \| undefined`                     | Optional | See the linked contract and this family's rules for its interpretation. |
| `reasoning`         | `"low" \| "medium" \| "high" \| "xhigh" \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `approvalReviewer`  | `"user" \| "auto_review" \| undefined`                | Optional | See the linked contract and this family's rules for its interpretation. |
| `model`             | `string \| undefined`                                 | Optional | Native CLI model identifier; availability depends on the account.       |
| `variables`         | `Readonly<Record<string, string>> \| undefined`       | Optional | Explicit environment declarations; values are strings.                  |
| `saveConversations` | `boolean \| undefined`                                | Optional | Enable native transcript capture when the adapter supports it.          |

## Signature

```ts
export interface CodexSettings extends CommonAgentSettings {
  readonly modelProvider?: CodexModelProvider;
  readonly reasoning?: "low" | "medium" | "high" | "xhigh";
  readonly approvalReviewer?: "user" | "auto_review";
}
```

## Related contracts

- [CodexModelProvider](../codexmodelprovider/)
- [CommonAgentSettings](../support-commonagentsettings/)
