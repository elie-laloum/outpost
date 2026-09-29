---
title: "WorkflowJson"
description: "WorkflowJson — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { WorkflowJson } from "@elie-laloum/outpost";
```

## Rôle et comportement

Valeur JSON qui se sérialise sans perte : null, booléen, nombre fini autre que -0, chaîne, tableau ou objet simple de ces valeurs. Utilisée pour les clés de cache de tâche, les entrées et résultats des jobs de file, les payloads de déclencheur et l’état des tâches interactives ; les sorties de checkpoint doivent avoir cette forme ou valoir undefined.

[Exemple complet et règles détaillées](../../guide/durable-runs/).

## Signature

```ts
export type WorkflowJson =
  | null
  | boolean
  | number
  | string
  | readonly WorkflowJson[]
  | {
      readonly [key: string]: WorkflowJson;
    };
```
