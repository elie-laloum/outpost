---
title: "OpenAIModelProviderOptions"
description: "OpenAIModelProviderOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: provider contract for custom harnesses with messages, tool calls, replayable reasoning, history caching and streaming. It may change in a later release.
:::

## Import

```ts
import type { OpenAIModelProviderOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name               | Type                                             | Presence | Meaning                                                                                                                                                            |
| ------------------ | ------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `api`              | `"chat-completions" \| "responses" \| undefined` | Optional | HTTP protocol: chat-completions by default, or responses. No automatic protocol fallback.                                                                          |
| `baseUrl`          | `string`                                         | Required | Absolute HTTP(S) API base URL, including any /v1 prefix; excludes credentials, query and fragment. The selected protocol path is appended.                         |
| `apiKey`           | `string \| false`                                | Required | Explicit bearer API key, or false for an unauthenticated endpoint. No environment variable or account login is read automatically.                                 |
| `timeoutMs`        | `number \| undefined`                            | Optional | Positive deadline in milliseconds; defaults to 120000 and cannot exceed 2147483647. It covers the whole request, or the silence between two chunks when streaming. |
| `maxResponseBytes` | `number \| undefined`                            | Optional | Positive maximum response body size in bytes after HTTP decompression; defaults to 8388608 (8 MiB). Oversized responses fail.                                      |

## Signature

```ts
export interface OpenAIModelProviderOptions extends HttpModelOptions {
  readonly api?: "chat-completions" | "responses";
}
```

## Related contracts

- [HttpModelOptions](../support-httpmodeloptions/)
