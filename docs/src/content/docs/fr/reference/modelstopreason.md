---
title: "ModelStopReason"
description: "ModelStopReason — Outpost API"
sidebar:
  order: 10
---

:::caution[Expérimental]
Expérimental : contrat de fournisseur pour les harness personnalisés, avec messages, appels d’outils, raisonnement rejouable, cache d’historique et streaming. Il peut changer dans une version ultérieure.
:::

## Import

```ts
import type { ModelStopReason } from "@elie-laloum/outpost";
```

## Signature

```ts
export type ModelStopReason = "end" | "tool-calls" | "max-tokens" | "refusal";
```
