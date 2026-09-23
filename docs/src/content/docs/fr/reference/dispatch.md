---
title: "dispatch"
description: "dispatch — Outpost API"
sidebar:
  order: 10
---

Contrat public de **dispatch**. Consultez le [guide dispatch](../../agents/dispatch/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { dispatch } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function dispatch<T = undefined>(
  options: SandboxOptions & DispatchOptions<T> & RequiredAgent,
): Promise<DispatchResult<T>>;
```

## Contrats associés

- [DispatchOptions](../dispatchoptions/)
- [DispatchResult](../dispatchresult/)
- [RequiredAgent](../support-requiredagent/)
- [SandboxOptions](../sandboxoptions/)
