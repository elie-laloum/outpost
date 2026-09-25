---
title: "RequiredAgent"
description: "RequiredAgent — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom     | Type    | Présence | Rôle                              |
| ------- | ------- | -------- | --------------------------------- |
| `agent` | `Agent` | Requis   | Adapter natif de l’agent de code. |

## Signature

```ts
export interface RequiredAgent {
  readonly agent: Agent;
}
```

## Contrats associés

- [Agent](../type-agent/)
