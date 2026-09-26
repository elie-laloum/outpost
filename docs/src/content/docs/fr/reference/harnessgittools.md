---
title: "harnessGitTools"
description: "harnessGitTools — Outpost API"
sidebar:
  order: 0
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré introduit en 5.0.0. Le contrat peut changer dans une version ultérieure.
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
