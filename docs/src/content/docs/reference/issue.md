---
title: "Issue"
description: "Issue — Outpost API"
sidebar:
  order: 10
---

Public contract for **Issue**. See the [campaigns and backlogs guide](../../workflows/campaigns/) for behavior, defaults and examples.

## Import

```ts
import type { Issue } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface Issue {
  readonly id: string;
  readonly title: string;
  readonly body?: string;
  readonly blockedBy?: readonly string[];
}
```
