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

Declare reusable instructions, tool restrictions, MCP servers and hooks grouped by harness. Validation copies and freezes declarations without allocating a sandbox or reading credentials. Each harness uses only its hook section, before its local hooks.

[Complete example and detailed rules](../../guide/agent-profiles/).

## Parameters and properties

| Name                   | Type                                       | Presence | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------- | ------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`              | `AgentProfileOptions`                      | Required | Literal instructions, portable built-in tool allowlist, MCP servers and per-harness hook declarations to validate and freeze; unknown fields fail with code configuration.                                                                                                                                                                                                                                                                     |
| `options.hooks`        | `AgentProfileHooks \| undefined`           | Optional | Hooks grouped by harness. Each harness selects its own section and prepends it to locally declared hooks; other sections are ignored. An empty local list keeps profile hooks. Outpost executes the combined list in declaration order; CLI scheduling remains native.                                                                                                                                                                         |
| `options.instructions` | `string \| undefined`                      | Optional | Nonempty literal instruction text, without NUL. Native system/developer configuration for Claude/Codex, request prefix for other CLIs, and system instructions before harness additions for the built-in loop; no variable or command expansion. Kimi interactive requests refuse this field.                                                                                                                                                  |
| `options.allowedTools` | `readonly AgentProfileTool[] \| undefined` | Optional | Distinct read, edit, shell or shell:&lt;exact command> capabilities. Omitted preserves existing behavior; [] denies built-in action tools. The built-in loop still permits load_skill and declared MCP tools, resources and prompts, subject to additional permissions. Loading a skill never grants its tools. Enforced by the built-in loop and Claude command hooks; Codex, Copilot, Kimi and Antigravity refuse any list at createAgent(). |
| `options.mcpServers`   | `McpServers \| undefined`                  | Optional | MCP servers granted by this profile, validated and deeply copied with secret variable references and per-server filters. Merged with harness servers by name; a duplicate name fails at harness creation and unsupported adapter options fail at composition.                                                                                                                                                                                  |

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
