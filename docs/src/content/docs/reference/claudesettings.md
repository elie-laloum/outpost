---
title: "ClaudeSettings"
description: "ClaudeSettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ClaudeSettings } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                | Type                                                                                              | Presence | Meaning                                                                                                                                                                                                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `partialMessages`   | `boolean \| undefined`                                                                            | Optional | Pass --include-partial-messages to headless runs so the stream emits text-delta events. Interactive sessions are unchanged.                                                                                                                                                                                                         |
| `permissions`       | `"plan" \| "default" \| "acceptEdits" \| "auto" \| "dontAsk" \| "bypassPermissions" \| undefined` | Optional | Claude Code permission mode passed with --permission-mode. Without it, headless runs pass --dangerously-skip-permissions; interactive sessions keep the CLI’s approval prompts.                                                                                                                                                     |
| `authentication`    | `AgentAuthentication \| undefined`                                                                | Optional | Credential selection: "account" (subscription login), "usage" (API key), { account: { file \| key \| variable } } or { usage: { key \| variable } }. Codex rejects account key and variable and accepts only usage with modelProvider; unsupported forms fail when the agent is composed. Omitted, Outpost installs no credentials. |
| `variables`         | `Readonly<Record<string, string>> \| undefined`                                                   | Optional | Environment variables for this CLI’s commands, merged over .outpost/.env; a name also set by the sandbox provider fails with code configuration. Claude Code rejects CLAUDE_CODE_MAX_OUTPUT_TOKENS or MCP_TIMEOUT here when maxOutputTokens or startupTimeoutMs already sets it.                                                    |
| `saveConversations` | `boolean \| undefined`                                                                            | Optional | Save the native conversation after each turn, default true. false disables capture and cannot be combined with conversations.                                                                                                                                                                                                       |
| `conversations`     | `ConversationStore \| undefined`                                                                  | Optional | Conversation store used instead of the native one, such as createTransportConversations() over the agent’s format. A store of another format, or saveConversations: false, fails when the harness is created.                                                                                                                       |
| `mcpServers`        | `McpServers \| undefined`                                                                         | Optional | MCP servers keyed by name, passed on the command line: --mcp-config for Claude Code, -c overrides for Codex. Secrets stay variable references; an undeclared referenced variable fails before the agent starts.                                                                                                                     |
| `profile`           | `AgentProfile \| undefined`                                                                       | Optional | Portable declaration from defineAgentProfile(), projected into Claude Code or Codex requests. MCP servers merge with mcpServers and duplicate names fail at harness creation. Claude applies built-in tool allowlists with a command hook and requires dontAsk; Codex refuses any allowlist.                                        |

## Signature

```ts
export interface ClaudeSettings extends CommonAgentSettings {
  readonly partialMessages?: boolean;
  readonly permissions?:
    | "default"
    | "acceptEdits"
    | "plan"
    | "auto"
    | "dontAsk"
    | "bypassPermissions";
}
```

## Related contracts

- [CommonAgentSettings](../support-commonagentsettings/)
