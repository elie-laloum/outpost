---
title: "defineHarnessHook"
description: "defineHarnessHook — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineHarnessHook } from "@elie-laloum/outpost/harness";
```

## Purpose and behavior

Declare a callback or sandbox command for one of the 13 Outpost loop phases. Hooks run in declaration order; invalid decisions and callback failures fail the turn. Model transformations preserve original usage, refusal and output limits. Rewritten tool calls still pass schema and permission checks.

[Complete example and detailed rules](../../guide/harness-hooks/).

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name                | Type                                                                                                             | Presence          | Meaning                                                                                                                                                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `HarnessHookOptions<Phase>`                                                                                      | Required          | Loop phase, optional name and control function of the hook.                                                                                                                                                                     |
| `options.on`        | `Phase`                                                                                                          | Required          | Loop point where the hook runs.                                                                                                                                                                                                 |
| `options.name`      | `string \| undefined`                                                                                            | Optional          | Name for diagnostics, default the phase name.                                                                                                                                                                                   |
| `options.timeoutMs` | `number \| undefined`                                                                                            | Optional          | Positive callback or command deadline in milliseconds; defaults to 30000. Callbacks must honor signal for host work.                                                                                                            |
| `options.command`   | `HookCommand \| undefined`                                                                                       | Variant-dependent | Sandbox program receiving the serializable hook context as JSON on stdin. Return a phase-specific JSON decision or empty stdout. Nonzero exit, invalid output or stdout over 1 MiB fails the turn. Mutually exclusive with run. |
| `options.run`       | `undefined \| (input: HarnessHookInput<Phase>) => HarnessHookResult<Phase> \| Promise<HarnessHookResult<Phase>>` | Variant-dependent | Control function for this phase. Hooks of a phase run in declaration order; an exception fails the turn, and an invalid decision fails it with code configuration.                                                              |

## Returns

`HarnessHook<Phase>`

## Signature

```ts
export declare function defineHarnessHook<Phase extends HarnessHookPhase>(
  options: HarnessHookOptions<Phase>,
): HarnessHook<Phase>;
```

## Related contracts

- [HarnessHook](../harnesshook/)
- [HarnessHookOptions](../harnesshookoptions/)
- [HarnessHookPhase](../harnesshookphase/)
