---
title: "AntigravitySettings"
description: "AntigravitySettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AntigravitySettings } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                                            | Presence | Meaning                                                                                                                                                                                                                     |
| ---------------- | ----------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authentication` | `AgentAuthentication \| undefined`              | Optional | "account" or account.file copies the agy Google sign-in token from ~/.gemini/antigravity-cli; usage forms forward GEMINI_API_KEY and select the Gemini API. Account key and variable fail when the agent is composed.       |
| `variables`      | `Readonly<Record<string, string>> \| undefined` | Optional | Environment variables for agy commands, merged over .outpost/.env; AGY_CLI_DISABLE_AUTO_UPDATE is always true. A name also set by the sandbox provider fails with code configuration.                                       |
| `mcpServers`     | `McpServers \| undefined`                       | Optional | MCP servers merged into .gemini/config/mcp_config.json in the agent home, keyed by server name; other servers in the file are kept. On the local provider this is your own home. Each referenced variable must be declared. |
| `mode`           | `"accept-edits" \| "plan" \| undefined`         | Optional | Antigravity execution mode passed with --mode. Without it, headless runs pass --dangerously-skip-permissions; interactive sessions keep the CLI's approval prompts.                                                         |

## Signature

```ts
export interface AntigravitySettings {
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly mcpServers?: McpServers;
  readonly mode?: "accept-edits" | "plan";
}
```

## Related contracts

- [AgentAuthentication](../agentauthentication/)
- [McpServers](../mcpservers/)
- [Variables](../variables/)
