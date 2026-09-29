---
title: "codexHarness"
description: "codexHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { codexHarness } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a Codex harness from execution, authentication and conversation settings without starting the CLI. Compose it with agent({ harness, model }) to select a model independently. The CLI owns its internal model/tool loop.

[Complete example and detailed rules](../../guide/agents/harness/).

## Parameters and properties

| Name                         | Type                                            | Presence | Meaning                                                                                                                                                                                                                                                                                          |
| ---------------------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `settings`                   | `CodexSettings \| undefined`                    | Optional | Configuration for the Codex harness; pass the selected model to agent() instead.                                                                                                                                                                                                                 |
| `settings.modelProvider`     | `CodexModelProvider \| undefined`               | Optional | Custom Codex model endpoint configuration; requires Responses API compatibility.                                                                                                                                                                                                                 |
| `settings.approvalReviewer`  | `"user" \| "auto_review" \| undefined`          | Optional | Codex approval reviewer: the user or automatic approval review.                                                                                                                                                                                                                                  |
| `settings.authentication`    | `AgentAuthentication \| undefined`              | Optional | Explicit authentication for this CLI harness: "account", "usage", { account: { file \| key \| variable } } or { usage: { key \| variable } }. Unsupported forms fail when the agent is composed. Omission prepares nothing and keeps the access already configured in the execution environment. |
| `settings.variables`         | `Readonly<Record<string, string>> \| undefined` | Optional | Explicit environment declarations; values are strings.                                                                                                                                                                                                                                           |
| `settings.saveConversations` | `boolean \| undefined`                          | Optional | Enable native transcript capture when the adapter supports it.                                                                                                                                                                                                                                   |
| `settings.conversations`     | `ConversationStore \| undefined`                | Optional | Store that captures, locates and restores this agent’s sessions instead of the default native store, such as transportConversations() with the agent’s format. The format must match the agent, and saveConversations must not be false.                                                         |
| `settings.mcpServers`        | `McpServers \| undefined`                       | Optional | MCP servers this CLI can use, keyed by server name. Outpost renders them in the CLI’s native configuration and references secrets by variable name only; each referenced variable must be declared.                                                                                              |

## Returns

`CliHarness`

## Signature

```ts
export declare function codexHarness(settings?: CodexSettings): CliHarness;
```

## Related contracts

- [CliHarness](../cliharness/)
- [CodexSettings](../codexsettings/)
