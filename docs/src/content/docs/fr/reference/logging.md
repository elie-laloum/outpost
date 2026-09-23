---
title: "Logging"
description: "Logging — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Logging**. Consultez le [guide observabilité](../../agents/observability/) pour le comportement, les valeurs par défaut et des exemples.

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
