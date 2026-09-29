---
title: "McpPromptOptions"
description: "McpPromptOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { McpPromptOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                                            | Presence | Meaning                                                                 |
| ----------- | ----------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `server`    | `string`                                        | Required | Name of an MCP server declared on the same harness that offers prompts. |
| `name`      | `string`                                        | Required | Prompt name as listed by the server.                                    |
| `arguments` | `Readonly<Record<string, string>> \| undefined` | Optional | String arguments of the prompt; values are passed as given.             |

## Signature

```ts
export interface McpPromptOptions {
  readonly server: string;
  readonly name: string;
  readonly arguments?: Readonly<Record<string, string>>;
}
```
