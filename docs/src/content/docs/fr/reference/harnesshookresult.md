---
title: "HarnessHookResult"
description: "HarnessHookResult — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { HarnessHookResult } from "@elie-laloum/outpost";
```

## Rôle et comportement

Ce que renvoie le run() d’un hook de harness pour sa phase : une décision, ou undefined pour ne rien changer. session-start : { instructions } ajoute des instructions ; before-tool : { deny } refuse l’appel avec ce motif, { input } remplace son entrée ; after-tool : { result } remplace le résultat de l’outil ; stop : { continue } envoie ce texte et relance la boucle ; before-model et after-model observent seulement. Toute autre forme échoue avec le code configuration.

[Exemple complet et règles détaillées](../../guide/harness-permissions/).

## Signature

```ts
export type HarnessHookResult<Phase extends HarnessHookPhase> =
  HarnessHookDecisions[Phase] | undefined | void;
```

## Contrats associés

- [HarnessHookDecisions](../harnesshookdecisions/)
- [HarnessHookPhase](../harnesshookphase/)
