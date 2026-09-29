---
title: "TriggerOutcome"
description: "TriggerOutcome — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { TriggerOutcome } from "@elie-laloum/outpost";
```

## Rôle et comportement

Issue d’une livraison de webhook vérifiée, transmise à TriggerSource.reply(). Valeurs : "accepted" (la route a publié un job de file ; réponse par défaut 202 avec { job }), "ignored" (la route n’a renvoyé aucun job ; réponse par défaut 204).

[Exemple complet et règles détaillées](../../guide/webhooks/).

## Signature

```ts
export type TriggerOutcome = "accepted" | "ignored";
```
