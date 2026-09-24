---
title: "ContainerOptions"
description: "ContainerOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ContainerOptions**. Consultez le [guide providers](../../providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ContainerOptions } from "@elie-laloum/outpost/providers/docker";
import type { ContainerOptions } from "@elie-laloum/outpost/providers/podman";
```

## Signature

```ts
export interface ContainerOptions {
  readonly caches?: readonly DependencyCache[];
  readonly image?: string;
  readonly user?: {
    readonly uid: number;
    readonly gid: number;
  };
  readonly volumes?: readonly Volume[];
  readonly variables?: Variables;
  readonly networks?: string | readonly string[];
  readonly groups?: readonly (string | number)[];
  readonly devices?: readonly string[];
  readonly cpus?: number;
  readonly memoryMb?: number;
  readonly label?: "z" | "Z" | false;
  readonly retain?: number;
  readonly userns?: "keep-id" | false;
}
```

## Contrats associés

- [DependencyCache](../dependencycache/)
- [Variables](../variables/)
- [Volume](../volume/)
