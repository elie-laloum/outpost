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

Crée le jeu d’outils edit. write_file crée ou remplace un fichier UTF-8 ; edit_file remplace un texte qui doit apparaître une seule fois sauf avec replace_all, conserve les fins de ligne et le mode du fichier, et renvoie une erreur sans écrire si le fichier a changé pendant la modification. Les deux déclarent leurs chemins pour les règles de permission et s’exécutent un par un.

[Exemple complet et règles détaillées](../../guide/harness-tools/).

## Retour

`HarnessToolset`

## Signature

```ts
export declare function createHarnessEditTools(): HarnessToolset;
```

## Contrats associés

- [HarnessToolset](../harnesstoolset/)
