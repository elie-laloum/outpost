---
title: "ResourceOperation"
description: "ResourceOperation — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ResourceOperation**. Consultez le [guide activité des ressources](../../operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ResourceOperation } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface ResourceOperation {
  readonly count: number;
  readonly kind: ResourceOperationKind;
  readonly startedAt: string;
}
```

## Contrats associés

- [ResourceOperationKind](../resourceoperationkind/)
