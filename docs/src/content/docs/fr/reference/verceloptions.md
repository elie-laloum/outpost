---
title: "VercelOptions"
description: "VercelOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **VercelOptions**. Consultez le [guide providers](../../providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { VercelOptions } from "@elie-laloum/outpost/providers/vercel";
```

## Signature

```ts
export interface VercelOptions {
  readonly create?: NonNullable<Parameters<typeof Sandbox.create>[0]>;
  readonly variables?: Variables;
  readonly root?: string;
  readonly retain?: number;
}
```

## Contrats associés

- [Variables](../variables/)
