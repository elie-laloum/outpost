---
title: "BacklogSettings"
description: "BacklogSettings — Outpost API"
sidebar:
  order: 10
---

Public contract for **BacklogSettings**. See the [campaigns and backlogs guide](../../workflows/campaigns/) for behavior, defaults and examples.

## Import

```ts
import type { BacklogSettings } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface BacklogSettings {
  readonly directory?: string;
  readonly label?: string;
  readonly deadlineMs?: number;
}
```
