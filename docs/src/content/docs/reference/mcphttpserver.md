---
title: "McpHttpServer"
description: "McpHttpServer — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { McpHttpServer } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                  | Type                                            | Presence | Meaning                                                                                                                                                                                                                                    |
| --------------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `url`                 | `string`                                        | Required | Absolute http or https URL of a Streamable HTTP MCP endpoint, without embedded credentials.                                                                                                                                                |
| `headers`             | `Readonly<Record<string, string>> \| undefined` | Optional | Non-secret HTTP headers sent with every request. Use bearerTokenVariable for an Authorization token.                                                                                                                                       |
| `bearerTokenVariable` | `string \| undefined`                           | Optional | Name of a declared variable whose value is sent as Authorization: Bearer. It cannot be combined with an Authorization header.                                                                                                              |
| `oauth`               | `"login" \| McpClientCredentials \| undefined`  | Optional | "login" reuses the MCP OAuth login stored by Claude Code, Codex or Kimi on the host; client credentials let the built-in harness request a token itself. Incompatible with bearerTokenVariable and an Authorization header.                |
| `tools`               | `McpToolFilter \| undefined`                    | Optional | Tool filter by exact MCP tool name. include keeps only the listed tools and exclude removes tools afterwards. Harnesses that cannot apply a part refuse it when the agent is composed.                                                     |
| `startupTimeoutMs`    | `number \| undefined`                           | Optional | Maximum time in milliseconds for the server to start, from 1 to 2147483647. The built-in harness defaults to 60000; Codex and Kimi apply it per server, Claude Code through one shared MCP_TIMEOUT, and Copilot and Antigravity refuse it. |

## Signature

```ts
export interface McpHttpServer {
  readonly url: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly bearerTokenVariable?: string;
  readonly oauth?: "login" | McpClientCredentials;
  readonly tools?: McpToolFilter;
  readonly startupTimeoutMs?: number;
}
```

## Related contracts

- [McpClientCredentials](../mcpclientcredentials/)
- [McpToolFilter](../mcptoolfilter/)
