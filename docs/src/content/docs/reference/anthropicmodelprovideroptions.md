---
title: "AnthropicModelProviderOptions"
description: "AnthropicModelProviderOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: bounded text requests and caller-supplied harness execution. No built-in tool loop, streaming or native custom-harness conversation persistence.
:::

## Import

```ts
import type { AnthropicModelProviderOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name               | Type                   | Presence | Meaning                                                                                                                               |
| ------------------ | ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `apiKey`           | `string`               | Required | Explicit Anthropic API key sent in x-api-key; no CLI account or host credential discovery.                                            |
| `baseUrl`          | `string \| undefined`  | Optional | Messages API base URL including its version prefix; defaults to https://api.anthropic.com/v1.                                         |
| `cacheSystem`      | `boolean \| undefined` | Optional | Opt in to an ephemeral cache breakpoint on the system text. Requests must contain system instructions; a cache hit is not guaranteed. |
| `timeoutMs`        | `number \| undefined`  | Optional | Positive request deadline in milliseconds, covering headers and the complete body; defaults to 120000 and cannot exceed 2147483647.   |
| `maxResponseBytes` | `number \| undefined`  | Optional | Positive maximum response body size in bytes after HTTP decompression; defaults to 8388608 (8 MiB). Oversized responses fail.         |

## Signature

```ts
export interface AnthropicModelProviderOptions {
  readonly apiKey: string;
  readonly baseUrl?: string;
  readonly cacheSystem?: boolean;
  readonly timeoutMs?: number;
  readonly maxResponseBytes?: number;
}
```
