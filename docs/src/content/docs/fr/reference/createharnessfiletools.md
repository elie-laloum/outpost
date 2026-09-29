---
title: "createHarnessFileTools"
description: "createHarnessFileTools — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createHarnessFileTools } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le jeu d’outils files : read_file renvoie les lignes numérotées d’un fichier UTF-8 téléchargé depuis le sandbox, et list_files liste les fichiers que Git suit ou n’ignore pas. Les deux sont en lecture seule et déclarent leurs chemins pour les règles de permission.

[Exemple complet et règles détaillées](../../guide/harness/).

## Retour

`HarnessToolset`

## Signature

```ts
export declare function createHarnessFileTools(): HarnessToolset;
```

## Contrats associés

- [HarnessToolset](../harnesstoolset/)
