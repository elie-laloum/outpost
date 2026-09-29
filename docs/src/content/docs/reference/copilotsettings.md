---
title: "CopilotSettings"
description: "CopilotSettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CopilotSettings } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                                            | Presence | Meaning                                                                                                                                                                                                                                                        |
| ---------------- | ----------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authentication` | `AgentAuthentication \| undefined`              | Optional | Account forms only: "account" forwards the token that copilot login stored in ~/.copilot/config.json as COPILOT_GITHUB_TOKEN, key or variable forward a fine-grained token. Usage forms fail when the agent is composed, and classic ghp_ tokens are rejected. |
| `variables`      | `Readonly<Record<string, string>> \| undefined` | Optional | Environment variables for Copilot commands, merged over .outpost/.env; COPILOT_AUTO_UPDATE defaults to false. A name also set by the sandbox provider fails with code configuration.                                                                           |
| `conversations`  | `ConversationStore \| undefined`                | Optional | Store that captures, locates and restores Copilot session bundles instead of the default native store, such as createTransportConversations(createCopilotConversations(), …). A store that declares another format is rejected when the harness is created.    |
| `mcpServers`     | `McpServers \| undefined`                       | Optional | MCP servers passed to Copilot with --additional-mcp-config for each run, keyed by server name. Secrets stay ${NAME} references expanded by Copilot; each referenced variable must be declared.                                                                 |

## Signature

```ts
export interface CopilotSettings {
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly conversations?: ConversationStore;
  readonly mcpServers?: McpServers;
}
```

## Related contracts

- [AgentAuthentication](../agentauthentication/)
- [ConversationStore](../conversationstore/)
- [McpServers](../mcpservers/)
- [Variables](../variables/)
