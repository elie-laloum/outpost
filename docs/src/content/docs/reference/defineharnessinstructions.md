---
title: "defineHarnessInstructions"
description: "defineHarnessInstructions — Outpost API"
sidebar:
  order: 0
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Skills and streaming are not available yet; the contract may change before release.
:::

## Import

```ts
import { defineHarnessInstructions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define system instructions from text or from a resolver called at the start of each turn with the sandbox, signal and model. The resolved text is not stored in the conversation.

[Complete example and detailed rules](../../guide/agents/harness/).

## Parameters and properties

| Name     | Type                       | Presence | Meaning                                                                                                                       |
| -------- | -------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `source` | `HarnessInstructionSource` | Required | Nonempty instruction text, or a function that receives the sandbox, signal and model and returns the text when a turn starts. |

## Returns

`HarnessInstructions`

## Signature

```ts
export declare function defineHarnessInstructions(
  source: HarnessInstructionSource,
): HarnessInstructions;
```

## Related contracts

- [HarnessInstructions](../harnessinstructions/)
- [HarnessInstructionSource](../harnessinstructionsource/)
