---
title: "harnessEditTools"
description: "harnessEditTools — Outpost API"
sidebar:
  order: 0
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré introduit en 5.0.0. Le contrat peut changer dans une version ultérieure.
:::

## Import

```ts
import { harnessEditTools } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le jeu d’outils edit : write_file crée ou remplace un fichier, et edit_file remplace un texte exact, conserve fins de ligne et permissions et refuse d’écraser un fichier modifié pendant l’opération.

[Exemple complet et règles détaillées](../../guide/agents/harness/).

## Retour

`HarnessToolset`

## Signature

```ts
export declare function harnessEditTools(): HarnessToolset;
```

## Contrats associés

- [HarnessToolset](../harnesstoolset/)
