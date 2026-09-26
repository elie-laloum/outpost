---
title: "JsonSchema"
description: "JsonSchema — Outpost API"
sidebar:
  order: 10
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Hooks, permissions, conversations persistées et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { JsonSchema } from "@elie-laloum/outpost";
```

## Signature

```ts
export type JsonSchema = Readonly<Record<string, unknown>>;
```
