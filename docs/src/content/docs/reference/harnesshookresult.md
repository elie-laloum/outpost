---
title: "HarnessHookResult"
description: "HarnessHookResult — Outpost API"
sidebar:
  order: 10
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Skills and streaming are not available yet; the contract may change before release.
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

## Related contracts

- [HarnessHookDecisions](../harnesshookdecisions/)
- [HarnessHookPhase](../harnesshookphase/)
