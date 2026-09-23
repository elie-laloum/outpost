---
title: "IssueOutcome"
description: "IssueOutcome — Outpost API"
sidebar:
  order: 10
---

Public contract for **IssueOutcome**. See the [campaigns and backlogs guide](../../workflows/campaigns/) for behavior, defaults and examples.

## Import

```ts
import type { IssueOutcome } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface IssueOutcome {
  readonly id: string;
  readonly branch: string;
  readonly state: "empty" | "failed" | "merged";
  readonly error?: unknown;
}
```
