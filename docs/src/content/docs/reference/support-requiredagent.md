---
title: "RequiredAgent"
description: "RequiredAgent — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name    | Type    | Presence | Meaning                      |
| ------- | ------- | -------- | ---------------------------- |
| `agent` | `Agent` | Required | Native coding-agent adapter. |

## Signature

```ts
export interface RequiredAgent {
  readonly agent: Agent;
}
```

## Related contracts

- [Agent](../type-agent/)
