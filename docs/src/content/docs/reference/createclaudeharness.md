---
title: "createClaudeHarness"
description: "createClaudeHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createClaudeHarness } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create the Claude Code CLI preset without starting the CLI; createAgent({ harness, model }) binds it and rejects unsupported settings. It captures, resumes and forks conversations, accepts live steering over stream-json, reasoning low to max and maxOutputTokens.

[Complete example and detailed rules](../../guide/claude-code/).

## Parameters and properties

| Name                         | Type                                                                                              | Presence | Meaning                                                                                                                                                                                                                                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings`                   | `ClaudeSettings \| undefined`                                                                     | Optional | Claude Code settings; model, reasoning and maxOutputTokens belong on createAgent() and are rejected here.                                                                                                                                                                                                                           |
| `settings.partialMessages`   | `boolean \| undefined`                                                                            | Optional | Pass --include-partial-messages to headless runs so the stream emits text-delta events. Interactive sessions are unchanged.                                                                                                                                                                                                         |
| `settings.permissions`       | `"plan" \| "default" \| "acceptEdits" \| "auto" \| "dontAsk" \| "bypassPermissions" \| undefined` | Optional | Claude Code permission mode passed with --permission-mode. Without it, headless runs pass --dangerously-skip-permissions; interactive sessions keep the CLI’s approval prompts.                                                                                                                                                     |
| `settings.authentication`    | `AgentAuthentication \| undefined`                                                                | Optional | Credential selection: "account" (subscription login), "usage" (API key), { account: { file \| key \| variable } } or { usage: { key \| variable } }. Codex rejects account key and variable and accepts only usage with modelProvider; unsupported forms fail when the agent is composed. Omitted, Outpost installs no credentials. |
| `settings.variables`         | `Readonly<Record<string, string>> \| undefined`                                                   | Optional | Environment variables for this CLI’s commands, merged over .outpost/.env; a name also set by the sandbox provider fails with code configuration. Claude Code rejects CLAUDE_CODE_MAX_OUTPUT_TOKENS or MCP_TIMEOUT here when maxOutputTokens or startupTimeoutMs already sets it.                                                    |
| `settings.saveConversations` | `boolean \| undefined`                                                                            | Optional | Save the native conversation after each turn, default true. false disables capture and cannot be combined with conversations.                                                                                                                                                                                                       |
| `settings.conversations`     | `ConversationStore \| undefined`                                                                  | Optional | Conversation store used instead of the native one, such as createTransportConversations() over the agent’s format. A store of another format, or saveConversations: false, fails when the harness is created.                                                                                                                       |
| `settings.mcpServers`        | `McpServers \| undefined`                                                                         | Optional | MCP servers keyed by name, passed on the command line: --mcp-config for Claude Code, -c overrides for Codex. Secrets stay variable references; an undeclared referenced variable fails before the agent starts.                                                                                                                     |
| `settings.profile`           | `AgentProfile \| undefined`                                                                       | Optional | Portable declaration from defineAgentProfile(), projected into Claude Code or Codex requests. MCP servers merge with mcpServers and duplicate names fail at harness creation. Claude applies built-in tool allowlists with a command hook and requires dontAsk; Codex refuses any allowlist.                                        |

## Returns

`CliHarness`

## Signature

```ts
export declare function createClaudeHarness(
  settings?: ClaudeSettings,
): CliHarness;
```

## Related contracts

- [ClaudeSettings](../claudesettings/)
- [CliHarness](../cliharness/)
