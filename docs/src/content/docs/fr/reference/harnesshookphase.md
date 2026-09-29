---
title: "HarnessHookPhase"
description: "HarnessHookPhase — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { HarnessHookPhase } from "@elie-laloum/outpost";
```

## Rôle et comportement

Point de la boucle du harness intégré où un hook s’exécute, fixé par son option on. Valeurs : "session-start" (une fois, avant la première requête modèle), "before-model" (avant chaque requête modèle), "after-model" (après chaque résultat du modèle), "before-tool" (avant chaque appel d’outil), "after-tool" (après chaque résultat d’outil), "stop" (quand le modèle donne une réponse finale).

[Exemple complet et règles détaillées](../../guide/harness-permissions/).

## Signature

```ts
export type HarnessHookPhase =
  | "session-start"
  | "before-model"
  | "after-model"
  | "before-tool"
  | "after-tool"
  | "stop";
```
