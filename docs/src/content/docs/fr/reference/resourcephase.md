---
title: "ResourcePhase"
description: "ResourcePhase — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ResourcePhase } from "@elie-laloum/outpost";
```

## Rôle et comportement

Phase de cycle de vie d’une sandbox dans son enregistrement d’activité de ressource ; l’enregistrement est supprimé après une libération propre. Valeurs : "allocating" (acquisition auprès du provider en cours), "ready" (sandbox démarrée), "closing" (libération en cours), "cleanup-failed" (échec de la libération ou du nettoyage du workspace ; des ressources peuvent subsister), "allocation-uncertain" (le démarrage a échoué avant que le provider ne renvoie un lease, une sandbox peut donc exister sans propriétaire).

[Exemple complet et règles détaillées](../../guide/recovery/).

## Signature

```ts
export type ResourcePhase = (typeof resourcePhases)[number];
```

## Contrats associés

- [resourcePhases](../support-resourcephases/)
