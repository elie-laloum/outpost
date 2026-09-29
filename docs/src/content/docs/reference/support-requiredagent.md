---
title: "RequiredAgent"
description: "RequiredAgent — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name    | Type    | Presence | Meaning                                                                                                             |
| ------- | ------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `agent` | `Agent` | Required | Agent whose CLI opens in the terminal. Built-in harness, replay and fallback agents reject with code configuration. |

## Signature

```ts
export interface RequiredAgent {
  readonly agent: Agent;
}
```

## Related contracts

- [Agent](../type-agent/)
