---
title: "ModelStopReason"
description: "ModelStopReason — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ModelStopReason } from "@elie-laloum/outpost";
```

## Rôle et comportement

Raison de la fin d’un résultat de modèle, normalisée par chaque provider de modèle dans ModelResult.stopReason. Valeurs : "end" (réponse finale), "tool-calls" (le modèle demande des appels d’outils), "max-tokens" (limite de sortie ou de fenêtre de contexte atteinte ; le harness intégré échoue avec le code limit), "refusal" (refus ou filtre de contenu ; le harness intégré échoue avec le code response).

[Exemple complet et règles détaillées](../../guide/model-providers/).

## Signature

```ts
export type ModelStopReason = "end" | "tool-calls" | "max-tokens" | "refusal";
```
