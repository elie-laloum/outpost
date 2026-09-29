---
title: "ReplayDivergenceKind"
description: "ReplayDivergenceKind — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ReplayDivergenceKind } from "@elie-laloum/outpost";
```

## Rôle et comportement

Type d’écart détecté par un agent de rejeu, dans ReplayDivergence.kind. Valeurs : "prompt" (le tour a reçu un prompt différent de l’enregistrement), "baseline" (le tour a démarré d’un arbre de workspace différent), "tree" (un commit enregistré n’a pas pu être reproduit ; toujours fatal quand son patch ne s’applique pas), "exhausted" (le journal n’a plus de tour ; toujours fatal), "unrecorded" (le journal n’a pas de commits de workspace, car il a été enregistré sans logging.replayable).

[Exemple complet et règles détaillées](../../guide/record-replay/).

## Signature

```ts
export type ReplayDivergenceKind =
  "prompt" | "baseline" | "tree" | "exhausted" | "unrecorded";
```
