---
title: "McpToolFilter"
description: "McpToolFilter — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { McpToolFilter } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                             | Presence | Meaning                                                                                                                                          |
| --------- | -------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `include` | `readonly string[] \| undefined` | Optional | Distinct MCP tool names to keep. Claude Code and Antigravity refuse it; in the built-in harness a name the server does not offer fails the turn. |
| `exclude` | `readonly string[] \| undefined` | Optional | Distinct MCP tool names to remove after include. Copilot keeps them listed but refuses their calls.                                              |

## Signature

```ts
export interface McpToolFilter {
  readonly include?: readonly string[];
  readonly exclude?: readonly string[];
}
```
