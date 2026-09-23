---
title: "Logging"
description: "Logging — Outpost API"
sidebar:
  order: 10
---

Public contract for **Logging**. See the [observability guide](../../agents/observability/) for behavior, defaults and examples.

## Import

```ts
import type { Logging } from "@elie-laloum/outpost";
```

## Signature

```ts
export type Logging =
  | false
  | "stdout"
  | {
      readonly file?: string;
      readonly verbose?: boolean;
    };
```
