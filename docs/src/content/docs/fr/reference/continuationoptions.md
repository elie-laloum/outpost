---
title: "ContinuationOptions"
description: "ContinuationOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ContinuationOptions**. Consultez le [guide dispatch](../../agents/dispatch/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ContinuationOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export type ContinuationOptions<T = undefined> = DispatchOptions<T> &
  Omit<SandboxOptions, "agent">;
```

## Contrats associés

- [DispatchOptions](../dispatchoptions/)
- [SandboxOptions](../sandboxoptions/)
