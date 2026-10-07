---
title: "KimiSettings"
description: "KimiSettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { KimiSettings } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                                            | Presence | Meaning                                                                                                                                                                                                                                                                                                  |
| ---------------- | ----------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `region`         | `"mainland-cn" \| "global" \| undefined`        | Optional | Kimi account deployment: "global" for kimi.ai (default) or "mainland-cn" for kimi.com, which selects the OAuth file and sign-in endpoints. Setting it with usage authentication fails when the harness is created.                                                                                       |
| `authentication` | `AgentAuthentication \| undefined`              | Optional | "account" copies the region’s OAuth file and device_id from ~/.kimi-code (or KIMI_CODE_HOME, or the account.file profile directory) and runs kimi login in the sandbox. Usage forms forward KIMI_API_KEY and require a model on createAgent(); account key and variable fail when the agent is composed. |
| `variables`      | `Readonly<Record<string, string>> \| undefined` | Optional | Environment variables for Kimi commands, merged over .outpost/.env; KIMI_CODE_NO_AUTO_UPDATE defaults to 1. A name also set by the sandbox provider fails with code configuration.                                                                                                                       |
| `conversations`  | `ConversationStore \| undefined`                | Optional | Store that captures, locates and restores Kimi session bundles instead of the default native store, such as createTransportConversations(createKimiConversations(), …). A store that declares another format is rejected when the harness is created.                                                    |
| `mcpServers`     | `McpServers \| undefined`                       | Optional | MCP servers merged into .kimi-code/mcp.json in the agent home, keyed by server name; other servers in the file are kept. On the local provider this is your own home. Each referenced variable must be declared.                                                                                         |
| `profile`        | `AgentProfile \| undefined`                     | Optional | Portable declaration from defineAgentProfile(), projected into Kimi Code requests. MCP servers merge with mcpServers and duplicate names fail at harness creation. Kimi Code refuses any built-in tool allowlist at createAgent(). Kimi refuses profile instructions on interactive requests.            |

## Signature

```ts
export interface KimiSettings {
  readonly region?: "mainland-cn" | "global";
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly conversations?: ConversationStore;
  readonly mcpServers?: McpServers;
  readonly profile?: AgentProfile;
}
```

## Related contracts

- [AgentAuthentication](../agentauthentication/)
- [AgentProfile](../agentprofile/)
- [ConversationStore](../conversationstore/)
- [McpServers](../mcpservers/)
- [Variables](../variables/)
