---
title: "PromptVariables"
description: "PromptVariables — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { PromptVariables } from "@elie-laloum/outpost";
```

## Rôle et comportement

Valeurs des emplacements {{name}} d’un brief fichier (Brief.values) : chaînes, nombres finis ou booléens. WORK_BRANCH et BASE_BRANCH sont réservés ; un emplacement sans valeur échoue avec le code prompt.

[Exemple complet et règles détaillées](../../guide/briefs/).

## Signature

```ts
export type PromptVariables = Readonly<
  Record<string, string | number | boolean>
>;
```
