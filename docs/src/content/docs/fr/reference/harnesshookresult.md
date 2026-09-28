---
title: "HarnessHookResult"
description: "HarnessHookResult — Outpost API"
sidebar:
  order: 10
---

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
