---
title: "BranchPolicy"
description: "BranchPolicy — Outpost API"
sidebar:
  order: 10
---

Contrat public de **BranchPolicy**. Consultez le [guide workspaces](../../sandboxes/workspaces/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { BranchPolicy } from "@elie-laloum/outpost";
```

## Signature

```ts
export type BranchPolicy =
  | {
      readonly mode: "current";
    }
  | {
      readonly mode: "named";
      readonly name: string;
      readonly from?: string;
    }
  | {
      readonly mode: "integrate";
      readonly from?: string;
    };
```
