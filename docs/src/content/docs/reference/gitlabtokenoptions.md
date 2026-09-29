---
title: "GitlabTokenOptions"
description: "GitlabTokenOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { GitlabTokenOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name    | Type            | Presence | Meaning                                                                                                                                                                                                                                                  |
| ------- | --------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `token` | `TriggerSecret` | Required | Secret token compared in constant time with X-Gitlab-Token, or a callback returning every currently accepted token; weaker because the body is not signed. An empty string throws at creation; a callback that fails or returns nothing denies requests. |

## Signature

```ts
export interface GitlabTokenOptions {
  /** Plain-text `X-Gitlab-Token`; weaker, since the request body is not signed. */
  readonly token: TriggerSecret;
}
```

## Related contracts

- [TriggerSecret](../triggersecret/)
