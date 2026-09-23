---
title: "daytona"
description: "daytona — Outpost API"
sidebar:
  order: 10
---

Contrat public de **daytona**. Consultez le [guide providers](../../providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { daytona } from "@elie-laloum/outpost/providers/daytona";
```

## Signature

```ts
import type { Daytona, DaytonaConfig } from "@daytona/sdk";

export declare function daytona(
  options?: DaytonaOptions,
  connect?: (
    config?: DaytonaConfig,
  ) => Promise<Pick<Daytona, "create" | "delete">>,
): SandboxProvider;
```

## Contrats associés

- [DaytonaOptions](../daytonaoptions/)
- [SandboxProvider](../sandboxprovider/)
