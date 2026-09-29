---
title: "FallbackTrigger"
description: "FallbackTrigger — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { FallbackTrigger } from "@elie-laloum/outpost";
```

## Rôle et comportement

Catégorie d’échec qui fait passer le dispatch d’un agent de repli au candidat suivant, listée dans l’option on de createFallbackAgent(). Valeurs : "quota" (limite d’usage ou de débit définitive, code quota), "unavailable" (panne reconnue par unavailableFault() ; l’erreur garde son code process, provider ou timeout).

[Exemple complet et règles détaillées](../../guide/fallback-agents/).

## Signature

```ts
export type FallbackTrigger = "quota" | "unavailable";
```
