---
title: "CodexSettings"
description: "CodexSettings — Outpost API"
sidebar:
  order: 10
---

Public contract for **CodexSettings**. See the [agents guide](../../agents/adapters/) for behavior, defaults and examples.

## Import

```ts
import type { CodexSettings } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface CodexSettings extends CommonAgentSettings {
  readonly modelProvider?: CodexModelProvider;
  readonly reasoning?: "low" | "medium" | "high" | "xhigh";
  readonly approvalReviewer?: "user" | "auto_review";
}
```

## Related contracts

- [CodexModelProvider](../codexmodelprovider/)
- [CommonAgentSettings](../support-commonagentsettings/)
