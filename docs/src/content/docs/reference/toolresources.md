---
title: "ToolResources"
description: "ToolResources — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ToolResources } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                             | Presence | Meaning                                                                                                                                                                                                                |
| ----------- | -------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `paths`     | `readonly string[] \| undefined` | Optional | Repository-relative paths the call reads or writes.                                                                                                                                                                    |
| `command`   | `string \| undefined`            | Optional | Command line the call runs, for command permission rules.                                                                                                                                                              |
| `mcpServer` | `string \| undefined`            | Optional | Declared MCP server selected by a resource or prompt tool. Built-in profile permissions check this name, including inherited parent profiles; it does not grant access by itself or add a declarative permission rule. |

## Signature

```ts
export interface ToolResources {
  readonly paths?: readonly string[];
  readonly command?: string;
  readonly mcpServer?: string;
}
```
