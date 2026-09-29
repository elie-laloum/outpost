---
title: "createHarnessEditTools"
description: "createHarnessEditTools — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createHarnessEditTools } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le jeu d’outils edit : write_file crée ou remplace un fichier, et edit_file remplace un texte exact, conserve fins de ligne et permissions et refuse d’écraser un fichier modifié pendant l’opération.

[Exemple complet et règles détaillées](../../guide/agents/harness/).

## Retour

`HarnessToolset`

## Signature

```ts
export declare function createHarnessEditTools(): HarnessToolset;
```

## Contrats associés

- [HarnessToolset](../harnesstoolset/)
