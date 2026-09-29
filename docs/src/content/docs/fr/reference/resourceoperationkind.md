---
title: "ResourceOperationKind"
description: "ResourceOperationKind — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ResourceOperationKind } from "@elie-laloum/outpost";
```

## Rôle et comportement

Type d’opération de sandbox comptée dans un enregistrement d’activité de ressource. Valeurs : "dispatch", "attach", "diagnose", "command" (opérations exclusives de Sandbox du même nom), "invoke" (une commande du lease), "upload", "download" (transferts unitaires), "manifest", "upload-batch", "download-batch" (étapes de transfert par lots).

[Exemple complet et règles détaillées](../../guide/recovery/).

## Signature

```ts
export type ResourceOperationKind = (typeof resourceOperationKinds)[number];
```

## Contrats associés

- [resourceOperationKinds](../support-resourceoperationkinds/)
