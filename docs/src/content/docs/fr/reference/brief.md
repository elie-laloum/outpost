---
title: "Brief"
description: "Brief — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Brief**. Consultez le [guide prompts et réponses](../../agents/responses/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Brief } from "@elie-laloum/outpost";
```

## Signature

```ts
export type Brief =
  | {
      readonly text: string;
      readonly file?: never;
      readonly values?: never;
    }
  | {
      readonly file: string;
      readonly text?: never;
      readonly values?: PromptVariables;
    };
```

## Contrats associés

- [PromptVariables](../promptvariables/)
