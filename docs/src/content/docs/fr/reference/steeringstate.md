---
title: "SteeringState"
description: "SteeringState — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { SteeringState } from "@elie-laloum/outpost";
```

## Rôle et comportement

État d’un contrôleur Steering. Valeurs : "idle" (aucun dispatch attaché ; les messages envoyés attendent le suivant), "active" (attaché à un dispatch en cours ; les messages non remis sont rejetés avec le code steering à sa fin), "closed" (close() a été appelé ; les envois en attente et ultérieurs sont rejetés avec le code steering).

[Exemple complet et règles détaillées](../../guide/steering/).

## Signature

```ts
export type SteeringState = "idle" | "active" | "closed";
```
