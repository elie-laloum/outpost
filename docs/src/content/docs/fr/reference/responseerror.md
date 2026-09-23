---
title: "ResponseError"
description: "ResponseError — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ResponseError**. Consultez le [guide prompts et réponses](../../agents/responses/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { ResponseError } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare class ResponseError extends OutpostError {
  readonly tag: string;
  readonly raw: string | undefined;
  constructor(tag: string, message: string, raw?: string, cause?: unknown);
}
```

## Contrats associés

- [OutpostError](../outposterror/)
