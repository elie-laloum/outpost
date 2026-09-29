---
title: "ReplayDivergencePolicy"
description: "ReplayDivergencePolicy — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ReplayDivergencePolicy } from "@elie-laloum/outpost";
```

## Rôle et comportement

Option divergence de createReplayAgent(). Valeurs : "fail" (par défaut ; lève ReplayDivergence avec le code replay), "warn" (signale l’écart via le callback warn du dispatch et continue). Un journal épuisé ou un patch qui ne s’applique pas échoue toujours.

[Exemple complet et règles détaillées](../../guide/record-replay/).

## Signature

```ts
export type ReplayDivergencePolicy = "fail" | "warn";
```
