---
title: "HarnessInstructionSource"
description: "HarnessInstructionSource — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { HarnessInstructionSource } from "@elie-laloum/outpost";
```

## Purpose and behavior

Instruction text, or a function of HarnessInstructionContext (sandbox, signal, model, mcp) that returns it, possibly asynchronously. Accepted by defineHarnessInstructions() and a skill's instructions; empty text, or a function that resolves to anything but a string, fails with code configuration.

[Complete example and detailed rules](../../guide/harness-context/).

## Signature

```ts
export type HarnessInstructionSource =
  string | ((context: HarnessInstructionContext) => string | Promise<string>);
```

## Related contracts

- [HarnessInstructionContext](../harnessinstructioncontext/)
