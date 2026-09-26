---
title: "ModelStopReason"
description: "ModelStopReason — Outpost API"
sidebar:
  order: 10
---

:::caution[Expérimental]
Expérimental : messages, appels d’outils et raisonnement rejouable neutres vis-à-vis du fournisseur. Pas encore de streaming ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { ModelStopReason } from "@elie-laloum/outpost";
```

## Signature

```ts
export type ModelStopReason = "end" | "tool-calls" | "max-tokens" | "refusal";
```
