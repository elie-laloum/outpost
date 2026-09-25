---
title: "RequiredAgent"
description: "RequiredAgent — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Purpose and behavior

Run a process or attach a native interactive agent session with explicit stream ownership.

Command returns nonzero exit statuses; callers must check them. Attach requires a supported interactive provider. Vercel rejects attachment.

[Complete example and detailed rules](../../guide/environment/commands/).

## Parameters and properties

| Name    | Type           | Presence | Meaning                      |
| ------- | -------------- | -------- | ---------------------------- |
| `agent` | `AgentAdapter` | Required | Native coding-agent adapter. |

## Signature

```ts
export interface RequiredAgent {
  readonly agent: AgentAdapter;
}
```

## Related contracts

- [AgentAdapter](../agentadapter/)
