---
title: "HarnessHookResult"
description: "HarnessHookResult — Outpost API"
sidebar:
  order: 10
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré introduit en 5.0.0. Le contrat peut changer dans une version ultérieure.
:::

## Import

```ts
import type { HarnessHookResult } from "@elie-laloum/outpost";
```

## Signature

```ts
export type HarnessHookResult<Phase extends HarnessHookPhase> =
  HarnessHookDecisions[Phase] | undefined | void;
```

## Contrats associés

- [HarnessHookDecisions](../harnesshookdecisions/)
- [HarnessHookPhase](../harnesshookphase/)
