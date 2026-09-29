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

Declare harness instructions rendered from a prompt of a declared MCP server at the start of each turn. Construction validates the server name, prompt name and string arguments without contacting the server; resolution fails when the harness has no running server of that name or the server offers no prompts.

[Complete example and detailed rules](../../guide/harness/).

## Parameters and properties

| Name                | Type                                            | Presence | Meaning                                                                 |
| ------------------- | ----------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `options`           | `McpPromptOptions`                              | Required | Server, prompt name and string arguments of the prompt to render.       |
| `options.server`    | `string`                                        | Required | Name of an MCP server declared on the same harness that offers prompts. |
| `options.name`      | `string`                                        | Required | Prompt name as listed by the server.                                    |
| `options.arguments` | `Readonly<Record<string, string>> \| undefined` | Optional | String arguments of the prompt; values are passed as given.             |

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
