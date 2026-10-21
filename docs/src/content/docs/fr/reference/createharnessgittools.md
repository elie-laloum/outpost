---
title: "createHarnessGitTools"
description: "createHarnessGitTools — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createHarnessGitTools } from "@elie-laloum/outpost/harness";
```

## Rôle et comportement

Crée le jeu d’outils git : git exécute une commande status, diff, log ou show et refuse --no-index, --output, --ext-diff, --textconv, --open-files-in-pager et leurs abréviations. Les arguments de chemin absolu ou qualifié par une lettre de lecteur et les traversées vers un répertoire parent sont refusés. Il est en lecture seule et déclare la ligne de commande git &lt;command> &lt;arguments> pour les règles de permission.

[Exemple complet et règles détaillées](../../guide/harness-tools/).

## Retour

`HarnessToolset`

## Signature

```ts
export declare function createHarnessGitTools(): HarnessToolset;
```

## Contrats associés

- [HarnessToolset](../harnesstoolset/)
