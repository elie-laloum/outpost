---
title: "ObservationSource"
description: "ObservationSource — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ObservationSource } from "@elie-laloum/outpost";
```

## Rôle et comportement

Composant qui a émis une Observation, dans son champ source. Valeurs : "agent" (événements d’un agent CLI), "harness" (événements du harness intégré), "workflow" (événements de workflow), "sandbox" (allocation, dispatch et libération de la sandbox), "git" (allocation du workspace et intégration de branche), "hooks" (hooks de cycle de vie du workspace), "transfer" (transferts de fichiers et synchronisation du dépôt), "conversation" (capture et restauration de conversation), "recovery" (traitement des échecs de démarrage et rétention des recovery).

[Exemple complet et règles détaillées](../../guide/observability/).

## Signature

```ts
export type ObservationSource =
  | "agent"
  | "harness"
  | "workflow"
  | "sandbox"
  | "git"
  | "hooks"
  | "transfer"
  | "conversation"
  | "recovery";
```
