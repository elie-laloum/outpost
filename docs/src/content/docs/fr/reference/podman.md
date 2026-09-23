---
title: "podman"
description: "podman — Outpost API"
sidebar:
  order: 10
---

Contrat public de **podman**. Consultez le [guide providers](../../providers/overview/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { podman } from "@elie-laloum/outpost/providers/podman";
```

## Signature

```ts
export declare const podman: (options?: ContainerOptions) => SandboxProvider;
```

## Contrats associés

- [ContainerOptions](../containeroptions/)
