---
title: "codex"
description: "codex — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { codex } from "@elie-laloum/outpost";
```

## Purpose and behavior

Build the Codex CLI adapter with event decoding, native conversation capture and continuation support. modelProvider selects an explicit Responses-compatible endpoint. Creating the adapter only configures execution; credentials must be available inside the selected environment.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Parameters and properties

| Name                         | Type                                                  | Presence | Meaning                                                                                        |
| ---------------------------- | ----------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `settings`                   | `CodexSettings \| undefined`                          | Optional | Codex model, Responses provider, reasoning, approval reviewer and transcript-capture settings. |
| `settings.modelProvider`     | `CodexModelProvider \| undefined`                     | Optional | Custom Codex model endpoint configuration; requires Responses API compatibility.               |
| `settings.reasoning`         | `"low" \| "medium" \| "high" \| "xhigh" \| undefined` | Optional | Reasoning effort passed to the selected agent CLI.                                             |
| `settings.approvalReviewer`  | `"user" \| "auto_review" \| undefined`                | Optional | Codex approval reviewer: the user or automatic approval review.                                |
| `settings.model`             | `string \| undefined`                                 | Optional | Native CLI model identifier; availability depends on the account.                              |
| `settings.variables`         | `Readonly<Record<string, string>> \| undefined`       | Optional | Explicit environment declarations; values are strings.                                         |
| `settings.saveConversations` | `boolean \| undefined`                                | Optional | Enable native transcript capture when the adapter supports it.                                 |

## Returns

`AgentAdapter`

## Signature

```ts
export declare function codex(settings?: CodexSettings): AgentAdapter;
```

## Related contracts

- [AgentAdapter](../agentadapter/)
- [CodexSettings](../codexsettings/)
