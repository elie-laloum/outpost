---
title: "ReporterOptions"
description: "ReporterOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ReporterOptions**. Consultez le [guide observabilité](../../agents/observability/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ReporterOptions } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface ReporterOptions {
  readonly label?: string;
  readonly verbose?: boolean;
  readonly quiet?: boolean;
  readonly write?: (text: string) => void;
}
```
