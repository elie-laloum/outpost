---
title: "createHarnessSearchTools"
description: "createHarnessSearchTools — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createHarnessSearchTools } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le jeu d’outils search : search exécute git grep avec une expression régulière étendue sur les fichiers suivis et non ignorés, et renvoie des correspondances chemin:ligne:texte bornées.

[Exemple complet et règles détaillées](../../guide/harness/).

## Retour

`HarnessToolset`

## Signature

```ts
export declare function createHarnessSearchTools(): HarnessToolset;
```

## Contrats associés

- [HarnessToolset](../harnesstoolset/)
