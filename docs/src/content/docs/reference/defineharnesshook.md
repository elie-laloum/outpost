---
title: "defineHarnessHook"
description: "defineHarnessHook — Outpost API"
sidebar:
  order: 0
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Streaming is not available yet; the contract may change before release.
:::

## Import

```ts
import { defineHarnessHook } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define control code that runs at one point of the engine loop: session-start, before-model, after-model, before-tool, after-tool or stop. Unlike observers, a hook can add instructions, deny or rewrite a tool call, replace its result or refuse to stop; an exception from a hook fails the turn.

[Complete example and detailed rules](../../guide/agents/harness/).

## Parameters and properties

| Name           | Type                                                                                                | Presence | Meaning                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `options`      | `HarnessHookOptions<Phase>`                                                                         | Required | Loop phase, optional name and control function of the hook.                                              |
| `options.on`   | `Phase`                                                                                             | Required | Loop point where the hook runs.                                                                          |
| `options.name` | `string \| undefined`                                                                               | Optional | Optional name for diagnostics; defaults to the phase.                                                    |
| `options.run`  | `(input: HarnessHookInput<Phase>) => HarnessHookResult<Phase> \| Promise<HarnessHookResult<Phase>>` | Required | Control function for this phase. Hooks of a phase run in declaration order; an exception fails the turn. |

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
