---
title: "HarnessHookPhase"
description: "HarnessHookPhase — Outpost API"
sidebar:
  order: 10
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Skills et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
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
