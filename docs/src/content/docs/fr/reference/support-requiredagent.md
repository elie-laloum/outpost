---
title: "RequiredAgent"
description: "RequiredAgent — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom     | Type           | Présence | Rôle                              |
| ------- | -------------- | -------- | --------------------------------- |
| `agent` | `AgentAdapter` | Requis   | Adapter natif de l’agent de code. |

## Signature

```ts
export interface RequiredAgent {
  readonly agent: AgentAdapter;
}
```

## Contrats associés

- [AgentAdapter](../agentadapter/)
