---
title: "createAntigravityHarness"
description: "createAntigravityHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createAntigravityHarness } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create the Antigravity CLI (agy) preset without starting the CLI; createAgent({ harness, model }) binds it and rejects reasoning and maxOutputTokens. Resume, response repairs and steering work only inside the same open sandbox; conversation capture, cold resume and fork are rejected.

[Complete example and detailed rules](../../guide/antigravity/).

## Parameters and properties

| Name                      | Type                                            | Presence | Meaning                                                                                                                                                                                                                                |
| ------------------------- | ----------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings`                | `AntigravitySettings \| undefined`              | Optional | Antigravity settings; model, reasoning and maxOutputTokens belong on createAgent() and are rejected here, as is conversations.                                                                                                         |
| `settings.authentication` | `AgentAuthentication \| undefined`              | Optional | "account" or account.file copies the agy Google sign-in token from ~/.gemini/antigravity-cli; usage forms forward GEMINI_API_KEY and select the Gemini API. Account key and variable fail when the agent is composed.                  |
| `settings.variables`      | `Readonly<Record<string, string>> \| undefined` | Optional | Environment variables for agy commands, merged over .outpost/.env; AGY_CLI_DISABLE_AUTO_UPDATE is always true. A name also set by the sandbox provider fails with code configuration.                                                  |
| `settings.mcpServers`     | `McpServers \| undefined`                       | Optional | MCP servers merged into .gemini/config/mcp_config.json in the agent home, keyed by server name; other servers in the file are kept. On the local provider this is your own home. Each referenced variable must be declared.            |
| `settings.profile`        | `AgentProfile \| undefined`                     | Optional | Portable declaration from defineAgentProfile(), projected into Antigravity requests. MCP servers merge with mcpServers and duplicate names fail at harness creation. Antigravity refuses any built-in tool allowlist at createAgent(). |
| `settings.mode`           | `"accept-edits" \| "plan" \| undefined`         | Optional | Antigravity execution mode passed with --mode. Without it, headless runs pass --dangerously-skip-permissions; interactive sessions keep the CLI's approval prompts.                                                                    |

## Returns

`CliHarness`

## Signature

```ts
export declare function createAntigravityHarness(
  settings?: AntigravitySettings,
): CliHarness;
```

## Related contracts

- [AntigravitySettings](../antigravitysettings/)
- [CliHarness](../cliharness/)
