---
title: "CopilotHookPhase"
description: "CopilotHookPhase — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { CopilotHookPhase } from "@elie-laloum/outpost";
```

## Purpose and behavior

Native events accepted by defineCopilotHook, independently of Outpost loop phases. [Native reference](https://docs.github.com/en/copilot/reference/hooks-reference), reviewed on 2026-10-13.

[Complete example and detailed rules](../../guide/cli-hooks/).

## Signature

```ts
export type CopilotHookPhase = keyof CopilotHookEvents;
```

## Related contracts

- [CopilotHookEvents](../copilothookevents/)
