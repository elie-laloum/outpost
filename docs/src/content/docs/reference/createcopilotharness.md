---
title: "createCopilotHarness"
description: "createCopilotHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createCopilotHarness } from "@elie-laloum/outpost/core";
```

## Purpose and behavior

Create the GitHub Copilot CLI preset without starting the CLI; createAgent({ harness, model }) binds it and rejects reasoning and maxOutputTokens. It captures and resumes session bundles, accepts acknowledged steering through its native RPC server, and rejects fork. Native hooks, MCP servers or leases without live input use interruption/resume. Usage is reported per message, then as a session total read after exit.

[Complete example and detailed rules](../../guide/copilot-cli/).

## Parameters and properties

| Name                      | Type                                                           | Presence | Meaning                                                                                                                                                                                                                                                        |
| ------------------------- | -------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings`                | `CopilotSettings \| undefined`                                 | Optional | GitHub Copilot CLI settings; model, reasoning and maxOutputTokens belong on createAgent() and are rejected here.                                                                                                                                               |
| `settings.hooks`          | `readonly CopilotHook<keyof CopilotHookEvents>[] \| undefined` | Optional | Native Copilot hooks declared with defineCopilotHook. The collection is copied at composition; callbacks require live process input on the sandbox lease.                                                                                                      |
| `settings.authentication` | `AgentAuthentication \| undefined`                             | Optional | Account forms only: "account" forwards the token that copilot login stored in ~/.copilot/config.json as COPILOT_GITHUB_TOKEN, key or variable forward a fine-grained token. Usage forms fail when the agent is composed, and classic ghp_ tokens are rejected. |
| `settings.variables`      | `Readonly<Record<string, string>> \| undefined`                | Optional | Environment variables for Copilot commands, merged over .outpost/.env; COPILOT_AUTO_UPDATE defaults to false. A name also set by the sandbox provider fails with code configuration.                                                                           |
| `settings.conversations`  | `ConversationStore \| undefined`                               | Optional | Store that captures, locates and restores Copilot session bundles instead of the default native store, such as createTransportConversations(createCopilotConversations(), …). A store that declares another format is rejected when the harness is created.    |
| `settings.mcpServers`     | `McpServers \| undefined`                                      | Optional | MCP servers passed to Copilot with --additional-mcp-config for each run, keyed by server name. Secrets stay ${NAME} references expanded by Copilot; each referenced variable must be declared.                                                                 |
| `settings.profile`        | `AgentProfile \| undefined`                                    | Optional | Portable declaration from defineAgentProfile(), projected into Copilot CLI requests. MCP servers merge with mcpServers and duplicate names fail at harness creation. Copilot CLI refuses any built-in tool allowlist at createAgent().                         |

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
