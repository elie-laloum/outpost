---
title: "resourceOperationKinds"
description: "resourceOperationKinds — Outpost API"
sidebar:
  order: 10
---

Contrat auxiliaire non exporté directement ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Liste les noms d’opérations acceptés par l’enregistrement local d’activité ; ResourceOperationKind déduit ses valeurs autorisées de cette constante.

## Signature

```ts
export declare const resourceOperationKinds: readonly [
  "dispatch",
  "attach",
  "diagnose",
  "command",
  "invoke",
  "upload",
  "download",
  "manifest",
  "download-batch",
  "upload-batch",
];
```
