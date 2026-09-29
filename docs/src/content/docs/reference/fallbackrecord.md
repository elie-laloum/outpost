---
title: "FallbackRecord"
description: "FallbackRecord — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FallbackRecord } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                         | Presence | Meaning                                                                                                                                |
| ---------- | ---------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `selected` | `FallbackCandidate`          | Required | Candidate that produced the dispatch result; resume() and fork() continue with it.                                                     |
| `attempts` | `readonly FallbackAttempt[]` | Required | Candidates that stopped before the selected one, in order, with the failure that ended each; empty when the first candidate succeeded. |

## Signature

```ts
export interface FallbackRecord {
  /** Candidate that produced the dispatch result. */
  readonly selected: FallbackCandidate;
  /** Candidates that failed before it, in order. */
  readonly attempts: readonly FallbackAttempt[];
}
```

## Related contracts

- [FallbackAttempt](../fallbackattempt/)
- [FallbackCandidate](../fallbackcandidate/)
