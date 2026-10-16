---
title: "ClaudeHookPhase"
description: "ClaudeHookPhase — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ClaudeHookPhase } from "@elie-laloum/outpost";
```

## Purpose and behavior

Native events accepted by defineClaudeHook, independently of Outpost loop phases. [Native reference](https://code.claude.com/docs/en/hooks), reviewed on 2026-10-13.

[Complete example and detailed rules](../../guide/cli-hooks/).

## Signature

```ts
export type ClaudeHookPhase = keyof ClaudeHookEvents;
```

## Related contracts

- [ClaudeHookEvents](../claudehookevents/)
