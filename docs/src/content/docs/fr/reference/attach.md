---
title: "attach"
description: "attach — Outpost API"
sidebar:
  order: 10
---

Contrat public de **attach**. Consultez le [guide commandes et terminal](../../sandboxes/commands/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { attach } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function attach(
  options: SandboxOptions & AttachOptions & RequiredAgent,
): Promise<AttachResult>;
```

## Contrats associés

- [AttachOptions](../attachoptions/)
- [AttachResult](../attachresult/)
- [RequiredAgent](../support-requiredagent/)
- [SandboxOptions](../sandboxoptions/)
