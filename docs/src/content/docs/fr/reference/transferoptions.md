---
title: "TransferOptions"
description: "TransferOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **TransferOptions**. Consultez le [guide providers](../../providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { TransferOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface TransferOptions {
  readonly signal?: AbortSignal;
  readonly deadlineMs?: number;
}
```
