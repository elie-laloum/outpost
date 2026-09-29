---
title: "HarnessContextResult"
description: "HarnessContextResult — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { HarnessContextResult } from "@elie-laloum/outpost";
```

## Rôle et comportement

Ce que renvoie le compact() d’une stratégie de contexte avant chaque requête modèle du harness intégré : les messages qui remplacent l’historique, ou undefined pour le laisser inchangé. Les messages de remplacement sont validés et perdent leurs blocs de raisonnement.

[Exemple complet et règles détaillées](../../guide/harness-context/).

## Signature

```ts
export type HarnessContextResult = readonly ModelMessage[] | undefined;
```

## Contrats associés

- [ModelMessage](../modelmessage/)
