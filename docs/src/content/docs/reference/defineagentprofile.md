---
title: "defineAgentProfile"
description: "defineAgentProfile — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineAgentProfile } from "@elie-laloum/outpost";
```

## Purpose and behavior

Declare a CLI-independent, frozen agent profile without executing anything. Validate literal instructions, built-in tool allowlists and MCP declarations; copy nested lists and server configuration so later caller edits cannot change the profile. Each harness projects the declaration and refuses unsupported capabilities.

[Complete example and detailed rules](../../guide/choose-an-agent/).

## Parameters and properties

| Name                   | Type                                       | Presence | Meaning                                                                                                                                                                                                                                                                                                                                          |
| ---------------------- | ------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`              | `AgentProfileOptions`                      | Required | Literal instructions, portable built-in tool allowlist and MCP server declarations to validate and freeze; unknown fields fail with code configuration.                                                                                                                                                                                          |
| `options.instructions` | `string \| undefined`                      | Optional | Nonempty literal instruction text, without NUL. Native system/developer configuration for Claude/Codex, request prefix for other CLIs, and system instructions before harness additions for the built-in loop; no variable or command expansion. Kimi interactive requests refuse this field.                                                    |
| `options.allowedTools` | `readonly AgentProfileTool[] \| undefined` | Optional | Distinct read, edit, shell or shell:&lt;exact command> capabilities for built-in tools only. Omitted preserves existing behavior; [] denies all built-in tools. Explicit MCP declarations grant tools separately. Enforced by the built-in loop and Claude command hooks; Codex, Copilot, Kimi and Antigravity refuse any list at createAgent(). |
| `options.mcpServers`   | `McpServers \| undefined`                  | Optional | MCP servers granted by this profile, validated and deeply copied with secret variable references and per-server filters. Merged with harness servers by name; a duplicate name fails at harness creation and unsupported adapter options fail at composition.                                                                                    |

## Returns

`AgentProfile`

## Signature

```ts
export declare function defineAgentProfile(
  options: AgentProfileOptions,
): AgentProfile;
```

## Related contracts

- [AgentProfile](../agentprofile/)
- [AgentProfileOptions](../agentprofileoptions/)
