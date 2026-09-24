---
title: "QueueServer"
description: "QueueServer — Outpost API"
sidebar:
  order: 10
---

Contrat public de **QueueServer**. Consultez le [guide exécution distribuée](../../workflows/distributed/) pour le comportement, les valeurs par défaut et des exemples.

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
