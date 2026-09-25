---
title: "resourcePhases"
description: "resourcePhases — Outpost API"
sidebar:
  order: 10
---

Contrat auxiliaire non exporté directement ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Liste les phases de cycle de vie enregistrées dans les fichiers locaux d’activité des sandboxes ; ResourcePhase déduit ses valeurs autorisées de cette constante.

## Signature

```ts
export declare const resourcePhases: readonly [
  "allocating",
  "ready",
  "closing",
  "cleanup-failed",
  "allocation-uncertain",
];
```
