---
title: "harnessGitTools"
description: "harnessGitTools — Outpost API"
sidebar:
  order: 0
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Conversations persistées, jeux d’outils fournis et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import { harnessGitTools } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le jeu d’outils git : git exécute les commandes en lecture seule status, diff, log ou show et refuse les options qui écrivent des fichiers ou lancent des programmes externes.

[Exemple complet et règles détaillées](../../guide/agents/harness/).

## Retour

`HarnessToolset`

## Signature

```ts
export declare function harnessGitTools(): HarnessToolset;
```

## Contrats associés

- [HarnessToolset](../harnesstoolset/)
