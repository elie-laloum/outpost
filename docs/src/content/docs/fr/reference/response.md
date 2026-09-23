---
title: "response"
description: "response — Outpost API"
sidebar:
  order: 10
---

Contrat public de **response**. Consultez le [guide prompts et réponses](../../agents/responses/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { response } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare const response: {
  text: (options: TextResponseOptions) => ResponseSpec<string>;
  json: <T>(options: JsonResponseOptions<T>) => ResponseSpec<T>;
};
```

## Contrats associés

- [JsonResponseOptions](../support-jsonresponseoptions/)
- [ResponseSpec](../responsespec/)
- [TextResponseOptions](../support-textresponseoptions/)
