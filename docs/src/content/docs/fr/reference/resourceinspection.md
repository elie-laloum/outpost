---
title: "ResourceInspection"
description: "ResourceInspection — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ResourceInspection**. Consultez le [guide activité des ressources](../../operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ResourceInspection } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface ResourceInspection {
  readonly scope: "recorded-sandboxes";
  readonly complete: boolean;
  readonly entries: readonly ResourceInspectionEntry[];
  readonly issues: readonly StorageIssue[];
}
```

## Contrats associés

- [ResourceInspectionEntry](../resourceinspectionentry/)
- [StorageIssue](../support-storageissue/)
