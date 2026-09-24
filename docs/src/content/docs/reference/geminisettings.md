---
title: "GeminiSettings"
description: "GeminiSettings — Outpost API"
sidebar:
  order: 10
---

Public contract for **GeminiSettings**. See the [agents guide](../../agents/adapters/) for behavior, defaults and examples.

## Import

```ts
import type { GeminiSettings } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface GeminiSettings {
  readonly model?: string;
  readonly variables?: Variables;
  readonly approvalMode?: "default" | "auto_edit" | "yolo" | "plan";
}
```

## Related contracts

- [Variables](../variables/)
