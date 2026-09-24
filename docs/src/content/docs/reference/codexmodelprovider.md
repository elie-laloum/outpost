---
title: "CodexModelProvider"
description: "CodexModelProvider — Outpost API"
sidebar:
  order: 10
---

Public contract for **CodexModelProvider**. See the [agents guide](../../agents/adapters/) for behavior, defaults and examples.

## Import

```ts
import type { CodexModelProvider } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface CodexModelProvider {
  readonly baseUrl: string;
  readonly apiKeyEnvironment?: string | false;
}
```
