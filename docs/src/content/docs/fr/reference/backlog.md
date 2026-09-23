---
title: "Backlog"
description: "Backlog — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Backlog**. Consultez le [guide campagnes et backlogs](../../workflows/campaigns/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Backlog } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface Backlog {
  list(signal?: AbortSignal): Promise<readonly Issue[]>;
  get(id: string, signal?: AbortSignal): Promise<Issue>;
  close(id: string, signal?: AbortSignal): Promise<void>;
}
```

## Contrats associés

- [Issue](../issue/)
