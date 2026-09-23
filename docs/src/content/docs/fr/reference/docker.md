---
title: "docker"
description: "docker — Outpost API"
sidebar:
  order: 10
---

Contrat public de **docker**. Consultez le [guide providers](../../providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { docker } from "@elie-laloum/outpost/providers/docker";
```

## Signature

```ts
export declare const docker: (options?: ContainerOptions) => SandboxProvider;
```

## Contrats associés

- [ContainerOptions](../containeroptions/)
