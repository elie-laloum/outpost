---
title: "SandboxContext"
description: "SandboxContext — Outpost API"
sidebar:
  order: 10
---

Contrat public de **SandboxContext**. Consultez le [guide providers](../../providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { SandboxContext } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface SandboxContext {
  readonly repository: string;
  readonly directory: string;
  readonly gitDirectories: readonly string[];
  readonly variables: Variables;
  readonly signal?: AbortSignal;
}
```

## Contrats associés

- [Variables](../variables/)
