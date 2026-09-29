---
title: "JsonSchema"
description: "JsonSchema — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { JsonSchema } from "@elie-laloum/outpost";
```

## Rôle et comportement

Objet JSON Schema qui décrit l’entrée d’un outil de harness quand aucun Standard Schema n’est fourni, et forme sous laquelle HarnessTool.inputSchema l’expose au modèle. La racine doit décrire un objet, sinon la définition de l’outil échoue avec le code configuration.

[Exemple complet et règles détaillées](../../guide/harness-tools/).

## Signature

```ts
export type JsonSchema = Readonly<Record<string, unknown>>;
```
