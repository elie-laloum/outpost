---
title: "CodexSettings"
description: "CodexSettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CodexSettings } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                | Type                                            | Presence | Meaning                                                                                                                                                                                                                                                                                                                             |
| ------------------- | ----------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelProvider`     | `CodexModelProvider \| undefined`               | Optional | Custom Responses-compatible endpoint used instead of OpenAI. It requires a model name on createAgent() and accepts only usage authentication; both are checked when the agent is composed.                                                                                                                                          |
| `approvalReviewer`  | `"user" \| "auto_review" \| undefined`          | Optional | auto_review lets Codex’s automatic reviewer decide approval requests, with full file access. Otherwise headless runs bypass approvals and interactive sessions keep the CLI’s prompts.                                                                                                                                              |
| `authentication`    | `AgentAuthentication \| undefined`              | Optional | Credential selection: "account" (subscription login), "usage" (API key), { account: { file \| key \| variable } } or { usage: { key \| variable } }. Codex rejects account key and variable and accepts only usage with modelProvider; unsupported forms fail when the agent is composed. Omitted, Outpost installs no credentials. |
| `variables`         | `Readonly<Record<string, string>> \| undefined` | Optional | Environment variables for this CLI’s commands, merged over .outpost/.env; a name also set by the sandbox provider fails with code configuration. Claude Code rejects CLAUDE_CODE_MAX_OUTPUT_TOKENS or MCP_TIMEOUT here when maxOutputTokens or startupTimeoutMs already sets it.                                                    |
| `saveConversations` | `boolean \| undefined`                          | Optional | Save the native conversation after each turn, default true. false disables capture and cannot be combined with conversations.                                                                                                                                                                                                       |
| `conversations`     | `ConversationStore \| undefined`                | Optional | Conversation store used instead of the native one, such as createTransportConversations() over the agent’s format. A store of another format, or saveConversations: false, fails when the harness is created.                                                                                                                       |
| `mcpServers`        | `McpServers \| undefined`                       | Optional | MCP servers keyed by name, passed on the command line: --mcp-config for Claude Code, -c overrides for Codex. Secrets stay variable references; an undeclared referenced variable fails before the agent starts.                                                                                                                     |

## Signature

```ts
export interface CodexSettings extends CommonAgentSettings {
  readonly modelProvider?: CodexModelProvider;
  readonly approvalReviewer?: "user" | "auto_review";
}
```

## Related contracts

- [CodexModelProvider](../codexmodelprovider/)
- [CommonAgentSettings](../support-commonagentsettings/)
