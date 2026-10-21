---
title: "AntigravityHookPhase"
description: "AntigravityHookPhase — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { AntigravityHookPhase } from "@elie-laloum/outpost/core";
```

## Purpose and behavior

Native events accepted by defineAntigravityHook, independently of Outpost loop phases. [Native reference](https://antigravity.google/docs/hooks), reviewed on 2026-10-13.

[Complete example and detailed rules](../../guide/cli-hooks/).

## Signature

```ts
export type AntigravityHookPhase = keyof AntigravityHookEvents;
```

## Related contracts

- [AntigravityHookEvents](../antigravityhookevents/)
