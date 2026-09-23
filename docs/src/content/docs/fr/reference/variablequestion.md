---
title: "VariableQuestion"
description: "VariableQuestion — Outpost API"
sidebar:
  order: 10
---

Contrat public de **VariableQuestion**. Consultez le [guide commandes et terminal](../../sandboxes/commands/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { VariableQuestion } from "@elie-laloum/outpost";
```

## Signature

```ts
export type VariableQuestion = (
  key: string,
  signal?: AbortSignal,
) => Promise<string>;
```
