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

| Name    | Type            | Presence | Meaning                                                                                                                                                                                                                                   |
| ------- | --------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `token` | `TriggerSecret` | Required | Secret token compared with X-Gitlab-Token; weaker because the body is not signed. Secret, or callback returning every currently accepted secret; return old and new values during a rotation. An empty or failing source denies requests. |

## Signature

```ts
export interface GitlabTokenOptions {
  /** Plain-text `X-Gitlab-Token`; weaker, since the request body is not signed. */
  readonly token: TriggerSecret;
}
```

## Related contracts

- [TriggerSecret](../triggersecret/)
