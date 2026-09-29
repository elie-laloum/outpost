---
title: "McpToolFilter"
description: "McpToolFilter — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { McpToolFilter } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                             | Présence  | Rôle                                                                                                                                                               |
| --------- | -------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `include` | `readonly string[] \| undefined` | Optionnel | Noms d’outils MCP distincts à garder. Claude Code et Antigravity le refusent ; dans le harness intégré, un nom que le serveur ne propose pas fait échouer le tour. |
| `exclude` | `readonly string[] \| undefined` | Optionnel | Noms d’outils MCP distincts à retirer après include. Copilot les laisse listés mais refuse leurs appels.                                                           |

## Signature

```ts
export interface McpToolFilter {
  readonly include?: readonly string[];
  readonly exclude?: readonly string[];
}
```
