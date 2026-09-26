---
title: "HarnessHookPhase"
description: "HarnessHookPhase — Outpost API"
sidebar:
  order: 10
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré introduit en 5.0.0. Le contrat peut changer dans une version ultérieure.
:::

## Import

```ts
import type { HarnessHookPhase } from "@elie-laloum/outpost";
```

## Signature

```ts
export type HarnessHookPhase =
  | "session-start"
  | "before-model"
  | "after-model"
  | "before-tool"
  | "after-tool"
  | "stop";
```
