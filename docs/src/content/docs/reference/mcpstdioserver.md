---
title: "McpStdioServer"
description: "McpStdioServer — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { McpStdioServer } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name               | Type                                            | Presence | Meaning                                                                                                                                                                                                                                    |
| ------------------ | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `command`          | `string`                                        | Required | Executable started in the sandbox. Literal text; it cannot contain ${ or NUL.                                                                                                                                                              |
| `arguments`        | `readonly string[] \| undefined`                | Optional | Literal arguments passed to the command, without ${ references.                                                                                                                                                                            |
| `environment`      | `Readonly<Record<string, string>> \| undefined` | Optional | Non-secret environment values set for the server, written verbatim into the configuration.                                                                                                                                                 |
| `variables`        | `readonly string[] \| undefined`                | Optional | Names of declared variables forwarded to the server. Values never appear in arguments or files; a missing variable fails before the agent starts.                                                                                          |
| `tools`            | `McpToolFilter \| undefined`                    | Optional | Tool filter by exact MCP tool name. include keeps only the listed tools and exclude removes tools afterwards. Harnesses that cannot apply a part refuse it when the agent is composed.                                                     |
| `startupTimeoutMs` | `number \| undefined`                           | Optional | Maximum time in milliseconds for the server to start, from 1 to 2147483647. The built-in harness defaults to 60000; Codex and Kimi apply it per server, Claude Code through one shared MCP_TIMEOUT, and Copilot and Antigravity refuse it. |

## Signature

```ts
export interface McpStdioServer {
  readonly command: string;
  readonly arguments?: readonly string[];
  readonly environment?: Readonly<Record<string, string>>;
  readonly variables?: readonly string[];
  readonly tools?: McpToolFilter;
  readonly startupTimeoutMs?: number;
}
```

## Related contracts

- [McpToolFilter](../mcptoolfilter/)
