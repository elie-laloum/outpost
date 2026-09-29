---
title: "FallbackAttempt"
description: "FallbackAttempt — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FallbackAttempt } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                  | Presence | Meaning                                                                                                   |
| --------- | --------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `failure` | `FallbackTrigger`     | Required | Category that ended this candidate: quota or unavailable.                                                 |
| `message` | `string`              | Required | Quota or outage message that ended this candidate.                                                        |
| `resetAt` | `string \| undefined` | Optional | ISO reset timestamp reported with a quota failure; absent for outages and unknown resets.                 |
| `index`   | `number`              | Required | Zero-based position of the candidate in FallbackAgent.agents.                                             |
| `name`    | `string`              | Required | Adapter name of the candidate, such as claude, codex, custom or replay.                                   |
| `model`   | `string \| undefined` | Optional | Model name selected on the candidate; absent when a CLI keeps its native default, and for a replay agent. |

## Signature

```ts
export interface FallbackAttempt extends FallbackCandidate {
  readonly failure: FallbackTrigger;
  readonly message: string;
  readonly resetAt?: string;
}
```

## Related contracts

- [FallbackCandidate](../fallbackcandidate/)
- [FallbackTrigger](../fallbacktrigger/)
