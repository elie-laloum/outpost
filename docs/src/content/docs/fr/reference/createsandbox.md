---
title: "createSandbox"
description: "createSandbox — Outpost API"
sidebar:
  order: 10
---

Contrat public de **createSandbox**. Consultez le [guide sandboxes](../../sandboxes/lifecycle/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { createSandbox } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function createSandbox(
  options?: SandboxOptions,
): Promise<Sandbox>;
```

## Contrats associés

- [Sandbox](../sandbox/)
- [SandboxOptions](../sandboxoptions/)
