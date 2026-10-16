---
title: "HarnessHook"
description: "HarnessHook — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessHook } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name        | Type                                                                                                | Presence | Meaning                                                                                                              |
| ----------- | --------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `kind`      | `"hook"`                                                                                            | Required | Definition discriminator: hook.                                                                                      |
| `on`        | `Phase`                                                                                             | Required | Loop point where the hook runs.                                                                                      |
| `name`      | `string`                                                                                            | Required | Name used for diagnostics.                                                                                           |
| `timeoutMs` | `number \| undefined`                                                                               | Optional | Positive callback or command deadline in milliseconds; defaults to 30000. Callbacks must honor signal for host work. |
| `run`       | `(input: HarnessHookInput<Phase>) => HarnessHookResult<Phase> \| Promise<HarnessHookResult<Phase>>` | Required | Control function for this phase.                                                                                     |

## Signature

```ts
export interface HarnessHook<
  Phase extends HarnessHookPhase = HarnessHookPhase,
> {
  readonly kind: "hook";
  readonly on: Phase;
  readonly name: string;
  readonly timeoutMs?: number;
  run(
    input: HarnessHookInput<Phase>,
  ): HarnessHookResult<Phase> | Promise<HarnessHookResult<Phase>>;
}
```

## Related contracts

- [HarnessHookInput](../harnesshookinput/)
- [HarnessHookPhase](../harnesshookphase/)
- [HarnessHookResult](../harnesshookresult/)
