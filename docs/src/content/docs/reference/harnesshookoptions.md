---
title: "HarnessHookOptions"
description: "HarnessHookOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { HarnessHookOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name        | Type                                                                                                             | Presence          | Meaning                                                                                                                                                                                                                         |
| ----------- | ---------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `on`        | `Phase`                                                                                                          | Required          | Loop point where the hook runs.                                                                                                                                                                                                 |
| `name`      | `string \| undefined`                                                                                            | Optional          | Name for diagnostics, default the phase name.                                                                                                                                                                                   |
| `timeoutMs` | `number \| undefined`                                                                                            | Optional          | Positive callback or command deadline in milliseconds; defaults to 30000. Callbacks must honor signal for host work.                                                                                                            |
| `command`   | `undefined \| HookCommand`                                                                                       | Variant-dependent | Sandbox program receiving the serializable hook context as JSON on stdin. Return a phase-specific JSON decision or empty stdout. Nonzero exit, invalid output or stdout over 1 MiB fails the turn. Mutually exclusive with run. |
| `run`       | `(input: HarnessHookInput<Phase>) => HarnessHookResult<Phase> \| Promise<HarnessHookResult<Phase>> \| undefined` | Variant-dependent | Control function for this phase. Hooks of a phase run in declaration order; an exception fails the turn, and an invalid decision fails it with code configuration.                                                              |

## Signature

```ts
export type HarnessHookOptions<Phase extends HarnessHookPhase> = {
  readonly on: Phase;
  readonly name?: string;
  readonly timeoutMs?: number;
} & (
  | {
      readonly command?: never;
      run(
        input: HarnessHookInput<Phase>,
      ): HarnessHookResult<Phase> | Promise<HarnessHookResult<Phase>>;
    }
  | {
      readonly command: HookCommand;
      readonly run?: never;
    }
);
```

## Related contracts

- [HarnessHookInput](../harnesshookinput/)
- [HarnessHookPhase](../harnesshookphase/)
- [HarnessHookResult](../harnesshookresult/)
- [HookCommand](../hookcommand/)
