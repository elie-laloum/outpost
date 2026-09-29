---
title: "createCodexHarness"
description: "createCodexHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createCodexHarness } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create the Codex CLI preset without starting the CLI; createAgent({ harness, model }) binds it and rejects unsupported settings. It captures, resumes and forks conversations, accepts live steering through codex app-server and reasoning low to max, and rejects maxOutputTokens.

[Complete example and detailed rules](../../guide/codex/).

## Parameters and properties

| Name                         | Type                                            | Presence | Meaning                                                                                                                                                                                                                                                                                                                             |
| ---------------------------- | ----------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings`                   | `CodexSettings \| undefined`                    | Optional | Codex settings; model, reasoning and maxOutputTokens belong on createAgent() and are rejected here.                                                                                                                                                                                                                                 |
| `settings.modelProvider`     | `CodexModelProvider \| undefined`               | Optional | Custom Responses-compatible endpoint used instead of OpenAI. It requires a model name on createAgent() and accepts only usage authentication; both are checked when the agent is composed.                                                                                                                                          |
| `settings.approvalReviewer`  | `"user" \| "auto_review" \| undefined`          | Optional | auto_review lets Codex’s automatic reviewer decide approval requests, with full file access. Otherwise headless runs bypass approvals and interactive sessions keep the CLI’s prompts.                                                                                                                                              |
| `settings.authentication`    | `AgentAuthentication \| undefined`              | Optional | Credential selection: "account" (subscription login), "usage" (API key), { account: { file \| key \| variable } } or { usage: { key \| variable } }. Codex rejects account key and variable and accepts only usage with modelProvider; unsupported forms fail when the agent is composed. Omitted, Outpost installs no credentials. |
| `settings.variables`         | `Readonly<Record<string, string>> \| undefined` | Optional | Environment variables for this CLI’s commands, merged over .outpost/.env; a name also set by the sandbox provider fails with code configuration. Claude Code rejects CLAUDE_CODE_MAX_OUTPUT_TOKENS or MCP_TIMEOUT here when maxOutputTokens or startupTimeoutMs already sets it.                                                    |
| `settings.saveConversations` | `boolean \| undefined`                          | Optional | Save the native conversation after each turn, default true. false disables capture and cannot be combined with conversations.                                                                                                                                                                                                       |
| `settings.conversations`     | `ConversationStore \| undefined`                | Optional | Conversation store used instead of the native one, such as createTransportConversations() over the agent’s format. A store of another format, or saveConversations: false, fails when the harness is created.                                                                                                                       |
| `settings.mcpServers`        | `McpServers \| undefined`                       | Optional | MCP servers keyed by name, passed on the command line: --mcp-config for Claude Code, -c overrides for Codex. Secrets stay variable references; an undeclared referenced variable fails before the agent starts.                                                                                                                     |

## Returns

`CliHarness`

## Signature

```ts
export declare function createCodexHarness(
  settings?: CodexSettings,
): CliHarness;
```

## Related contracts

- [CliHarness](../cliharness/)
- [CodexSettings](../codexsettings/)
