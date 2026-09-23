---
title: "ClaudeSettings"
description: "ClaudeSettings — Outpost API"
sidebar:
  order: 10
---

Public contract for **ClaudeSettings**. See the [agents guide](../../agents/adapters/) for behavior, defaults and examples.

## Import

```ts
import type { ClaudeSettings } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface ClaudeSettings extends CommonAgentSettings {
  readonly reasoning?: "low" | "medium" | "high" | "xhigh" | "max";
  readonly permissions?:
    | "default"
    | "acceptEdits"
    | "plan"
    | "auto"
    | "dontAsk"
    | "bypassPermissions";
}
```

## Related contracts

- [CommonAgentSettings](../support-commonagentsettings/)
