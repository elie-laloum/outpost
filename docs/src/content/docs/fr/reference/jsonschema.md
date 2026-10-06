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

Objet JSON Schema décrivant l’entrée des outils de harness ou des réponses JSON. Les outils exigent une entrée objet et contrôlent leur sous-ensemble de mots-clés ; les consignes de réponse acceptent aussi les schémas décrivant tableaux, primitives et unions.

[Exemple complet et règles détaillées](../../guide/harness-tools/).

## Signature

```ts
export type JsonSchema = Readonly<Record<string, unknown>>;
```
