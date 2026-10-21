---
title: "KimiHookPhase"
description: "KimiHookPhase — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { KimiHookPhase } from "@elie-laloum/outpost/core";
```

## Purpose and behavior

Native events accepted by defineKimiHook, independently of Outpost loop phases. [Native reference](https://moonshotai.github.io/kimi-code/en/customization/hooks), reviewed on 2026-10-13.

[Complete example and detailed rules](../../guide/cli-hooks/).

## Signature

```ts
export type KimiHookPhase = keyof KimiHookEvents;
```

## Related contracts

- [KimiHookEvents](../kimihookevents/)
