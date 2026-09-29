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

## Rôle et comportement

Déclarations de serveurs MCP indexées par nom de serveur, chacune un serveur stdio (command) ou HTTP (url). Acceptées comme mcpServers par createHarness() et les presets de harness CLI ; les secrets sont référencés par nom de variable, jamais par valeur.

[Exemple complet et règles détaillées](../../guide/mcp-servers/).

## Signature

```ts
export type McpServers = {
  readonly [name: string]: McpServer;
};
```

## Contrats associés

- [McpServer](../mcpserver/)
