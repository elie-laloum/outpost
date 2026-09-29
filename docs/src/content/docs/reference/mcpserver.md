---
title: "McpServer"
description: "McpServer — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { McpServer } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name                  | Type                                            | Presence          | Meaning                                                                                                                                                                                                                                    |
| --------------------- | ----------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `command`             | `string`                                        | Variant-dependent | Executable started in the sandbox. Literal text; it cannot contain ${ or NUL.                                                                                                                                                              |
| `arguments`           | `readonly string[] \| undefined`                | Variant-dependent | Literal arguments passed to the command, without ${ references.                                                                                                                                                                            |
| `environment`         | `Readonly<Record<string, string>> \| undefined` | Variant-dependent | Non-secret environment values set for the server, written verbatim into the configuration.                                                                                                                                                 |
| `variables`           | `readonly string[] \| undefined`                | Variant-dependent | Names of declared variables forwarded to the server. Values never appear in arguments or files; a missing variable fails before the agent starts.                                                                                          |
| `tools`               | `McpToolFilter \| undefined`                    | Optional          | Tool filter by exact MCP tool name. include keeps only the listed tools and exclude removes tools afterwards. Harnesses that cannot apply a part refuse it when the agent is composed.                                                     |
| `startupTimeoutMs`    | `number \| undefined`                           | Optional          | Maximum time in milliseconds for the server to start, from 1 to 2147483647. The built-in harness defaults to 60000; Codex and Kimi apply it per server, Claude Code through one shared MCP_TIMEOUT, and Copilot and Antigravity refuse it. |
| `url`                 | `string`                                        | Variant-dependent | Absolute http or https URL of a Streamable HTTP MCP endpoint, without embedded credentials.                                                                                                                                                |
| `headers`             | `Readonly<Record<string, string>> \| undefined` | Variant-dependent | Non-secret HTTP headers sent with every request. Use bearerTokenVariable for an Authorization token.                                                                                                                                       |
| `bearerTokenVariable` | `string \| undefined`                           | Variant-dependent | Name of a declared variable whose value is sent as Authorization: Bearer. It cannot be combined with an Authorization header.                                                                                                              |
| `oauth`               | `"login" \| McpClientCredentials \| undefined`  | Variant-dependent | "login" reuses the MCP OAuth login stored by Claude Code, Codex or Kimi on the host; client credentials let the built-in harness request a token itself. Incompatible with bearerTokenVariable and an Authorization header.                |

## Signature

```ts
export type McpServer = McpStdioServer | McpHttpServer;
```

## Related contracts

- [McpHttpServer](../mcphttpserver/)
- [McpStdioServer](../mcpstdioserver/)
