---
title: "SteeringMode"
description: "SteeringMode — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { SteeringMode } from "@elie-laloum/outpost";
```

## Rôle et comportement

Manière dont une consigne de steering a atteint l’agent, dans SteeringDelivery.mode. Valeurs : "injected" (ajoutée au tour en cours via l’entrée en direct ou la boucle du harness intégré), "resumed" (Outpost a arrêté le tour puis poursuivi la conversation dans un nouveau tour).

[Exemple complet et règles détaillées](../../guide/steering/).

## Signature

```ts
export type SteeringMode = "injected" | "resumed";
```
