---
title: "defineMcpPrompt"
description: "defineMcpPrompt — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineMcpPrompt } from "@elie-laloum/outpost";
```

## Purpose and behavior

Declare instructions rendered at the start of each turn from a prompt of an MCP server declared on the same harness. Construction checks the server name, prompt name and string arguments without contacting the server; the turn fails with code configuration when that server is not running or offers no prompts.

[Complete example and detailed rules](../../guide/mcp-servers/).

## Parameters and properties

| Name                | Type                                            | Presence | Meaning                                                                   |
| ------------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------- |
| `options`           | `McpPromptOptions`                              | Required | Server, prompt name and string arguments of the prompt to render.         |
| `options.server`    | `string`                                        | Required | Name of an MCP server declared on the same harness that offers prompts.   |
| `options.name`      | `string`                                        | Required | Prompt name as listed by the server.                                      |
| `options.arguments` | `Readonly<Record<string, string>> \| undefined` | Optional | String arguments of the prompt, default none; values are passed as given. |

## Returns

`HarnessInstructions`

## Signature

```ts
export declare function defineMcpPrompt(
  options: McpPromptOptions,
): HarnessInstructions;
```

## Related contracts

- [HarnessInstructions](../harnessinstructions/)
- [McpPromptOptions](../mcppromptoptions/)
