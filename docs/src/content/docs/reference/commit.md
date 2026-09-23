---
title: "Commit"
description: "Commit — Outpost API"
sidebar:
  order: 10
---

Public contract for **Commit**. See the [workspaces guide](../../sandboxes/workspaces/) for behavior, defaults and examples.

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
