---
title: "RunStatus"
description: "RunStatus — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { RunStatus } from "@elie-laloum/outpost";
```

## Rôle et comportement

Cycle de vie de la projection : en cours, abandon présumé ou résultat terminé/suspendu du workflow ou dispatch. Abandoned est déduit à la lecture et n’autorise aucune récupération.

[Exemple complet et règles détaillées](../../guide/run-state/).

## Signature

```ts
export type RunStatus = "running" | "abandoned" | WorkflowResult["status"];
```

## Contrats associés

- [WorkflowResult](../workflowresult/)
