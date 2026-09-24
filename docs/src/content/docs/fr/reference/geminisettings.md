---
title: "GeminiSettings"
description: "GeminiSettings — Outpost API"
sidebar:
  order: 10
---

Contrat public de **GeminiSettings**. Consultez le [guide agents](../../agents/adapters/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { GeminiSettings } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface GeminiSettings {
  readonly model?: string;
  readonly variables?: Variables;
  readonly approvalMode?: "default" | "auto_edit" | "yolo" | "plan";
}
```

## Contrats associés

- [Variables](../variables/)
