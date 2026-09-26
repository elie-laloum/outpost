---
title: "harnessSearchTools"
description: "harnessSearchTools — Outpost API"
sidebar:
  order: 0
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Conversations persistées, jeux d’outils fournis et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import { harnessSearchTools } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le jeu d’outils search : search exécute git grep avec une expression régulière étendue sur les fichiers suivis et non ignorés, et renvoie des correspondances chemin:ligne:texte bornées.

[Exemple complet et règles détaillées](../../guide/agents/harness/).

## Retour

`HarnessToolset`

## Signature

```ts
export declare function harnessSearchTools(): HarnessToolset;
```

## Contrats associés

- [HarnessToolset](../harnesstoolset/)
