---
title: "firecracker"
description: "firecracker — Outpost API"
sidebar:
  order: 10
---

Contrat public de **firecracker**. Consultez le [guide prototype firecracker](../../providers/firecracker/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { firecracker } from "@elie-laloum/outpost/providers/firecracker";
```

## Signature

```ts
export declare function firecracker(
  options: FirecrackerOptions,
): SandboxProvider;
```

## Contrats associés

- [FirecrackerOptions](../firecrackeroptions/)
- [SandboxProvider](../sandboxprovider/)
