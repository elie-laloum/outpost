---
title: "QueueServer"
description: "QueueServer — Outpost API"
sidebar:
  order: 10
---

Public contract for **QueueServer**. See the [distributed execution guide](../../workflows/distributed/) for behavior, defaults and examples.

## Import

```ts
import type { QueueServer } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface QueueServer {
  readonly url: string;
  close(): Promise<void>;
}
```
