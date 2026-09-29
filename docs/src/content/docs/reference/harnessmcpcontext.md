---
title: "HarnessMcpContext"
description: "HarnessMcpContext — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessMcpContext } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type                                                                                                   | Presence | Meaning                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `prompt` | `(server: string, name: string, promptArguments: Readonly<Record<string, string>>) => Promise<string>` | Required | Render a prompt of a running MCP server as role-prefixed text. Fails when the server is not declared or offers no prompts. |

## Signature

```ts
export interface HarnessMcpContext {
  prompt(
    server: string,
    name: string,
    promptArguments: Readonly<Record<string, string>>,
  ): Promise<string>;
}
```
