---
title: "RequiredAgent"
description: "RequiredAgent — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom     | Type    | Présence | Rôle                                                                                                                                       |
| ------- | ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `agent` | `Agent` | Requis   | Agent dont la CLI s’ouvre dans le terminal. Les agents du harness intégré, de rejeu et de secours sont rejetés avec le code configuration. |

## Signature

```ts
export interface RequiredAgent {
  readonly agent: Agent;
}
```

## Contrats associés

- [Agent](../type-agent/)
