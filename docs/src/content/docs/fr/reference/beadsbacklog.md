---
title: "beadsBacklog"
description: "beadsBacklog — Outpost API"
sidebar:
  order: 10
---

Contrat public de **beadsBacklog**. Consultez le [guide campagnes et backlogs](../../workflows/campaigns/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { beadsBacklog } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function beadsBacklog(
  settings?: BacklogSettings,
  executor?: Executor,
): Backlog;
```

## Contrats associés

- [Backlog](../backlog/)
- [BacklogSettings](../backlogsettings/)
- [Executor](../support-executor/)
