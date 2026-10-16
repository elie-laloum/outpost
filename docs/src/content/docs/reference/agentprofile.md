---
title: "AgentProfile"
description: "AgentProfile — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentProfile } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name           | Type                                       | Presence | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------- | ------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`         | `"agent-profile"`                          | Required | Stable agent-profile discriminator checked by harness composition; obtain it from defineAgentProfile().                                                                                                                                                                                                                                                                                                                                        |
| `hooks`        | `AgentProfileHooks \| undefined`           | Optional | Hooks grouped by harness. Each harness selects its own section and prepends it to locally declared hooks; other sections are ignored. An empty local list keeps profile hooks. Outpost executes the combined list in declaration order; CLI scheduling remains native.                                                                                                                                                                         |
| `instructions` | `string \| undefined`                      | Optional | Nonempty literal instruction text, without NUL. Native system/developer configuration for Claude/Codex, request prefix for other CLIs, and system instructions before harness additions for the built-in loop; no variable or command expansion. Kimi interactive requests refuse this field.                                                                                                                                                  |
| `allowedTools` | `readonly AgentProfileTool[] \| undefined` | Optional | Distinct read, edit, shell or shell:&lt;exact command> capabilities. Omitted preserves existing behavior; [] denies built-in action tools. The built-in loop still permits load_skill and declared MCP tools, resources and prompts, subject to additional permissions. Loading a skill never grants its tools. Enforced by the built-in loop and Claude command hooks; Codex, Copilot, Kimi and Antigravity refuse any list at createAgent(). |
| `mcpServers`   | `McpServers \| undefined`                  | Optional | MCP servers granted by this profile, validated and deeply copied with secret variable references and per-server filters. Merged with harness servers by name; a duplicate name fails at harness creation and unsupported adapter options fail at composition.                                                                                                                                                                                  |

## Signature

```ts
export interface AgentProfile extends AgentProfileOptions {
  readonly kind: "agent-profile";
}
```

## Related contracts

- [AgentProfileOptions](../agentprofileoptions/)
