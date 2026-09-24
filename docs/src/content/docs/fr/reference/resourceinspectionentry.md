---
title: "ResourceInspectionEntry"
description: "ResourceInspectionEntry — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ResourceInspectionEntry**. Consultez le [guide activité des ressources](../../operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ResourceInspectionEntry } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface ResourceInspectionEntry {
  readonly path: string;
  readonly record?: ResourceActivityRecord;
  readonly ownership: LockOwnership;
}
```

## Contrats associés

- [LockOwnership](../support-lockownership/)
- [ResourceActivityRecord](../resourceactivityrecord/)
