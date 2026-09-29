---
title: "McpServers"
description: "McpServers — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { McpServers } from "@elie-laloum/outpost";
```

## Purpose and behavior

MCP server declarations keyed by server name, each a stdio server (command) or an HTTP server (url). Accepted as mcpServers by createHarness() and the CLI harness presets; secrets are referenced by variable name, never by value.

[Complete example and detailed rules](../../guide/mcp-servers/).

## Signature

```ts
export type McpServers = {
  readonly [name: string]: McpServer;
};
```

## Related contracts

- [McpServer](../mcpserver/)
