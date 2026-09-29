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

Crée le jeu d’outils git : git exécute une commande status, diff, log ou show et refuse --output, --ext-diff, --textconv et --open-files-in-pager. Il est en lecture seule et déclare la ligne de commande git &lt;command> &lt;arguments> pour les règles de permission.

[Exemple complet et règles détaillées](../../guide/harness-tools/).

## Retour

`HarnessToolset`

## Signature

```ts
export declare function createHarnessGitTools(): HarnessToolset;
```

## Contrats associés

- [HarnessToolset](../harnesstoolset/)
