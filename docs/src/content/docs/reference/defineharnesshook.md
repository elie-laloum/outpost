---
title: "defineHarnessHook"
description: "defineHarnessHook — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineHarnessHook } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define control code that runs at one point of the built-in harness loop: session-start, before-model, after-model, before-tool, after-tool or stop. Unlike observers, a hook can add instructions, deny or rewrite a tool call, replace its result or refuse to stop; an exception from a hook fails the turn.

[Complete example and detailed rules](../../guide/harness-permissions/).

## Parameters and properties

| Name           | Type                                                                                                | Presence | Meaning                                                                                                                                                            |
| -------------- | --------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`      | `HarnessHookOptions<Phase>`                                                                         | Required | Loop phase, optional name and control function of the hook.                                                                                                        |
| `options.on`   | `Phase`                                                                                             | Required | Loop point where the hook runs.                                                                                                                                    |
| `options.name` | `string \| undefined`                                                                               | Optional | Name for diagnostics, default the phase name.                                                                                                                      |
| `options.run`  | `(input: HarnessHookInput<Phase>) => HarnessHookResult<Phase> \| Promise<HarnessHookResult<Phase>>` | Required | Control function for this phase. Hooks of a phase run in declaration order; an exception fails the turn, and an invalid decision fails it with code configuration. |

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
