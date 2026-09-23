---
title: "Commit"
description: "Commit — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Commit**. Consultez le [guide workspaces](../../sandboxes/workspaces/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Commit } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface Commit {
  readonly oid: string;
  readonly subject: string;
}
```
