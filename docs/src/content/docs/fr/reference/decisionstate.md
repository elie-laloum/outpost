---
title: "DecisionState"
description: "DecisionState — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { DecisionState } from "@elie-laloum/outpost";
```

## Rôle et comportement

Texte, tableau JSON ou objet JSON de premier niveau utilisé en entrée de décision. La validation refuse une sérialisation qui perd ou modifie des valeurs.

[Exemple complet et règles détaillées](../../guide/decisions/).

## Signature

```ts
export type DecisionState =
  | string
  | readonly WorkflowJson[]
  | {
      readonly [key: string]: WorkflowJson;
    };
```

## Contrats associés

- [WorkflowJson](../workflowjson/)
