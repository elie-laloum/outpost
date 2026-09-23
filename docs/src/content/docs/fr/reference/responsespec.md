---
title: "ResponseSpec"
description: "ResponseSpec — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ResponseSpec**. Consultez le [guide prompts et réponses](../../agents/responses/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ResponseSpec } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface ResponseSpec<T> {
  readonly tag: string;
  readonly repairs: number;
  read(text: string): Promise<T>;
}
```
