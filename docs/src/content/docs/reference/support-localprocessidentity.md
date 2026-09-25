---
title: "LocalProcessIdentity"
description: "LocalProcessIdentity — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name        | Type     | Presence | Meaning                                                                         |
| ----------- | -------- | -------- | ------------------------------------------------------------------------------- |
| `host`      | `string` | Required | Host identity used to distinguish processes on different machines.              |
| `boot`      | `string` | Required | Operating-system boot identity used to detect process IDs from an earlier boot. |
| `namespace` | `string` | Required | Process namespace identity used when assessing local lock ownership.            |
| `started`   | `string` | Required | Operating-system process start identity used to detect PID reuse.               |

## Signature

```ts
export interface LocalProcessIdentity {
  readonly host: string;
  readonly boot: string;
  readonly namespace: string;
  readonly started: string;
}
```
