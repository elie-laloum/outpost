---
title: "PromptVariables"
description: "PromptVariables — Outpost API"
sidebar:
  order: 10
---

Contrat public de **PromptVariables**. Consultez le [guide prompts et réponses](../../agents/responses/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { PromptVariables } from "@elie-laloum/outpost";
```

## Signature

```ts
export type PromptVariables = Readonly<
  Record<string, string | number | boolean>
>;
```
