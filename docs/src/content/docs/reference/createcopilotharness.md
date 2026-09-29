---
title: "createCopilotHarness"
description: "createCopilotHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createCopilotHarness } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a GitHub Copilot CLI harness from execution, authentication and permission settings without starting the CLI. Compose it with createAgent({ harness, model }) to select a model name independently; reasoning and maxOutputTokens are rejected. Native session bundles support capture, warm/cold resume and response repairs. Automated fork is rejected. The CLI owns its internal model/tool loop.

[Complete example and detailed rules](../../guide/agents/harness/).

## Parameters and properties

| Name                      | Type                                            | Presence | Meaning                                                                                                                                                                                                                                                                                          |
| ------------------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `settings`                | `CopilotSettings \| undefined`                  | Optional | Configuration for the GitHub Copilot CLI harness; pass the selected model to createAgent() instead.                                                                                                                                                                                              |
| `settings.authentication` | `AgentAuthentication \| undefined`              | Optional | Explicit authentication for this CLI harness: "account", "usage", { account: { file \| key \| variable } } or { usage: { key \| variable } }. Unsupported forms fail when the agent is composed. Omission prepares nothing and keeps the access already configured in the execution environment. |
| `settings.variables`      | `Readonly<Record<string, string>> \| undefined` | Optional | Explicit environment declarations; values are strings.                                                                                                                                                                                                                                           |
| `settings.conversations`  | `ConversationStore \| undefined`                | Optional | Store that captures, locates and restores Copilot session bundles instead of the default native store, such as createTransportConversations("copilot", …). A store that declares another format is rejected when the harness is created.                                                         |
| `settings.mcpServers`     | `McpServers \| undefined`                       | Optional | MCP servers passed to Copilot with --additional-mcp-config for each run, keyed by server name. Secrets stay ${NAME} references expanded by Copilot; each referenced variable must be declared.                                                                                                   |

## Returns

`CliHarness`

## Signature

```ts
export declare function createCopilotHarness(
  settings?: CopilotSettings,
): CliHarness;
```

## Related contracts

- [CliHarness](../cliharness/)
- [CopilotSettings](../copilotsettings/)
