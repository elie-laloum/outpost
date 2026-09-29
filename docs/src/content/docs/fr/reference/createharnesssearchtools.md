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

Crée le jeu d’outils search : search exécute git grep avec une expression régulière étendue sur les fichiers texte suivis ou non ignorés et renvoie des correspondances chemin:ligne:texte, 200 au plus par appel. Il est en lecture seule et déclare son chemin pour les règles de permission.

[Exemple complet et règles détaillées](../../guide/harness-tools/).

## Retour

`HarnessToolset`

## Signature

```ts
export declare function createHarnessSearchTools(): HarnessToolset;
```

## Contrats associés

- [HarnessToolset](../harnesstoolset/)
