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

| Name                  | Type                                            | Presence | Meaning                                                                                                                       |
| --------------------- | ----------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `url`                 | `string`                                        | Required | Absolute http or https URL of a Streamable HTTP MCP endpoint, without embedded credentials.                                   |
| `headers`             | `Readonly<Record<string, string>> \| undefined` | Optional | Non-secret HTTP headers sent with every request. Use bearerTokenVariable for an Authorization token.                          |
| `bearerTokenVariable` | `string \| undefined`                           | Optional | Name of a declared variable whose value is sent as Authorization: Bearer. It cannot be combined with an Authorization header. |

## Signature

```ts
export interface McpHttpServer {
  readonly url: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly bearerTokenVariable?: string;
}
```
