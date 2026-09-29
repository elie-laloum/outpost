---
title: "ModelReasoning"
description: "ModelReasoning — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ModelReasoning } from "@elie-laloum/outpost";
```

## Rôle et comportement

Effort de raisonnement d’un AgentModel ou d’une ModelRequest. Valeurs, de l’effort le plus faible au plus élevé : "none", "minimal", "low", "medium", "high", "xhigh", "max". Le harness ou le provider de modèle qui exécute refuse un niveau non pris en charge dès la composition de l’agent : Claude Code et Codex acceptent de "low" à "max", le provider Anthropic toutes les valeurs sauf "minimal", le provider OpenAI transmet la valeur telle quelle et les autres agents CLI n’en acceptent aucune.

[Exemple complet et règles détaillées](../../guide/choose-an-agent/).

## Signature

```ts
export type ModelReasoning =
  "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";
```
