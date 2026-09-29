---
title: "QuotaResumePolicy"
description: "QuotaResumePolicy — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { QuotaResumePolicy } from "@elie-laloum/outpost";
```

## Rôle et comportement

Option quotaResume de defineAgentTask() et defineIsolatedTask() : manière dont une tâche reprend après une pause de quota. Valeurs : "continue" (par défaut ; poursuit la conversation capturée avec un brief de reprise quand l’agent est reprenable et que passes vaut 1, et un agent de repli relance le brief sur la branche interrompue), "restart" (exécute le brief d’origine dans une nouvelle conversation).

[Exemple complet et règles détaillées](../../guide/quota-pauses/).

## Signature

```ts
export type QuotaResumePolicy = "continue" | "restart";
```
