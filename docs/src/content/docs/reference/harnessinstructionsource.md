---
title: "HarnessInstructionSource"
description: "HarnessInstructionSource — Outpost API"
sidebar:
  order: 10
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Skills and streaming are not available yet; the contract may change before release.
:::

## Import

```ts
import type { HarnessInstructionSource } from "@elie-laloum/outpost";
```

## Signature

```ts
export type HarnessInstructionSource =
  string | ((context: HarnessInstructionContext) => string | Promise<string>);
```

## Related contracts

- [HarnessInstructionContext](../harnessinstructioncontext/)
