---
title: "AnthropicModelProviderOptions"
description: "AnthropicModelProviderOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AnthropicModelProviderOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name               | Type                   | Presence | Meaning                                                                                                                                                                      |
| ------------------ | ---------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apiKey`           | `string`               | Required | Explicit Anthropic API key sent in x-api-key; no CLI account or host credential discovery.                                                                                   |
| `baseUrl`          | `string \| undefined`  | Optional | Messages API base URL including its version prefix, default https://api.anthropic.com/v1; messages is appended. Credentials, query or fragment fail with code configuration. |
| `cacheSystem`      | `boolean \| undefined` | Optional | Adds an ephemeral cache breakpoint on the system text, default false. Requests without system instructions then fail with code configuration; a cache hit is not guaranteed. |
| `timeoutMs`        | `number \| undefined`  | Optional | Request deadline in milliseconds, default 120000, at most 2147483647. While streaming it restarts on each received chunk; expiry rejects with code timeout.                  |
| `maxResponseBytes` | `number \| undefined`  | Optional | Maximum response body in bytes after decompression, default 8388608 (8 MiB); a streamed response counts all its chunks. A larger response fails with code response.          |

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
