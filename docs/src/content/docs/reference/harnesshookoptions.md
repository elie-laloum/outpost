---
title: "HarnessHookOptions"
description: "HarnessHookOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Streaming is not available yet; the contract may change before release.
:::

## Import

```ts
import type { HarnessHookOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name   | Type                                                                                                | Presence | Meaning                                                                                                  |
| ------ | --------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `on`   | `Phase`                                                                                             | Required | Loop point where the hook runs.                                                                          |
| `name` | `string \| undefined`                                                                               | Optional | Optional name for diagnostics; defaults to the phase.                                                    |
| `run`  | `(input: HarnessHookInput<Phase>) => HarnessHookResult<Phase> \| Promise<HarnessHookResult<Phase>>` | Required | Control function for this phase. Hooks of a phase run in declaration order; an exception fails the turn. |

## Signature

```ts
export interface HarnessHookOptions<Phase extends HarnessHookPhase> {
  readonly on: Phase;
  readonly name?: string;
  run(
    input: HarnessHookInput<Phase>,
  ): HarnessHookResult<Phase> | Promise<HarnessHookResult<Phase>>;
}
```

## Related contracts

- [HarnessHookInput](../harnesshookinput/)
- [HarnessHookPhase](../harnesshookphase/)
- [HarnessHookResult](../harnesshookresult/)
