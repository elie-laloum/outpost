---
title: "ShellToolsOptions"
description: "ShellToolsOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Persisted conversations, built-in toolsets and streaming are not available yet; the contract may change before release.
:::

## Import

```ts
import type { ShellToolsOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                  | Presence | Meaning                                                                                                      |
| ------------ | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| `deadlineMs` | `number \| undefined` | Optional | Deadline of each shell command in milliseconds; defaults to 120,000. The harness tool deadline also applies. |

## Signature

```ts
export interface ShellToolsOptions {
  readonly deadlineMs?: number;
}
```
