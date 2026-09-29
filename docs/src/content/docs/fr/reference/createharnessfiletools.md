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

Crée le jeu d’outils files. read_file renvoie jusqu’à 2000 lignes numérotées d’un fichier UTF-8 et refuse les liens symboliques, les fichiers binaires et ceux de plus de 4 Mio ; list_files liste jusqu’à 1000 fichiers que Git suit ou n’ignore pas. Les deux sont en lecture seule et déclarent leurs chemins pour les règles de permission.

[Exemple complet et règles détaillées](../../guide/harness-tools/).

## Retour

`HarnessToolset`

## Signature

```ts
export declare function createHarnessFileTools(): HarnessToolset;
```

## Contrats associés

- [HarnessToolset](../harnesstoolset/)
