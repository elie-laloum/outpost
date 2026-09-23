---
title: "githubBacklog"
description: "githubBacklog — Outpost API"
sidebar:
  order: 10
---

Contrat public de **githubBacklog**. Consultez le [guide campagnes et backlogs](../../workflows/campaigns/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { githubBacklog } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function githubBacklog(
  settings?: BacklogSettings,
  executor?: Executor,
): Backlog;
```

## Contrats associés

- [Backlog](../backlog/)
- [BacklogSettings](../backlogsettings/)
- [Executor](../support-executor/)
