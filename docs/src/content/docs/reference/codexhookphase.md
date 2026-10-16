---
title: "CodexHookPhase"
description: "CodexHookPhase — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { CodexHookPhase } from "@elie-laloum/outpost";
```

## Purpose and behavior

Native events accepted by defineCodexHook, independently of Outpost loop phases. [Native reference](https://learn.chatgpt.com/docs/hooks), reviewed on 2026-10-13.

[Complete example and detailed rules](../../guide/cli-hooks/).

## Signature

```ts
export type CodexHookPhase = keyof CodexHookEvents;
```

## Related contracts

- [CodexHookEvents](../codexhookevents/)
