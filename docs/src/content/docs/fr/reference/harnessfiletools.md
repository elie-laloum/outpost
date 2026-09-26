---
title: "harnessFileTools"
description: "harnessFileTools — Outpost API"
sidebar:
  order: 0
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Le contrat peut changer avant publication.
:::

## Import

```ts
import { harnessFileTools } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le jeu d’outils files : read_file renvoie les lignes numérotées d’un fichier UTF-8 téléchargé depuis le sandbox, et list_files liste les fichiers que Git suit ou n’ignore pas. Les deux sont en lecture seule et déclarent leurs chemins pour les règles de permission.

[Exemple complet et règles détaillées](../../guide/agents/harness/).

## Retour

`HarnessToolset`

## Signature

```ts
export declare function harnessFileTools(): HarnessToolset;
```

## Contrats associés

- [HarnessToolset](../harnesstoolset/)
