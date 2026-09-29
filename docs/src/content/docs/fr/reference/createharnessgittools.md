---
title: "createHarnessGitTools"
description: "createHarnessGitTools — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createHarnessGitTools } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le jeu d’outils git : git exécute les commandes en lecture seule status, diff, log ou show et refuse les options qui écrivent des fichiers ou lancent des programmes externes.

[Exemple complet et règles détaillées](../../guide/harness/).

## Retour

`HarnessToolset`

## Signature

```ts
export declare function createHarnessGitTools(): HarnessToolset;
```

## Contrats associés

- [HarnessToolset](../harnesstoolset/)
