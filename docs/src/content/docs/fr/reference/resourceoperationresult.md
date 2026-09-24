---
title: "ResourceOperationResult"
description: "ResourceOperationResult — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ResourceOperationResult**. Consultez le [guide activité des ressources](../../operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ResourceOperationResult } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface ResourceOperationResult extends ResourceOperation {
  readonly id: string;
  readonly finishedAt: string;
  readonly outcome: "completed" | "failed";
}
```

## Contrats associés

- [ResourceOperation](../resourceoperation/)
