---
title: "TriggerSecret"
description: "TriggerSecret — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { TriggerSecret } from "@elie-laloum/outpost";
```

## Signature

```ts
export type TriggerSecret =
  string | (() => readonly string[] | Promise<readonly string[]>);
```
