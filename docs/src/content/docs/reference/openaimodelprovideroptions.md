---
title: "OpenAIModelProviderOptions"
description: "OpenAIModelProviderOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { OpenAIModelProviderOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name               | Type                                             | Presence | Meaning                                                                                                                                                                                                                       |
| ------------------ | ------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api`              | `"chat-completions" \| "responses" \| undefined` | Optional | HTTP protocol: chat-completions by default, or responses. No automatic protocol fallback.                                                                                                                                     |
| `baseUrl`          | `string`                                         | Required | Absolute HTTP(S) base URL including its version prefix, such as https://api.openai.com/v1; chat/completions or responses is appended. Credentials, query or fragment fail with code configuration, and redirects are refused. |
| `apiKey`           | `string \| false`                                | Required | Explicit bearer API key, or false for an unauthenticated endpoint. No environment variable or account login is read automatically.                                                                                            |
| `timeoutMs`        | `number \| undefined`                            | Optional | Request deadline in milliseconds, default 120000, at most 2147483647. While streaming it restarts on each received chunk; expiry rejects with code timeout.                                                                   |
| `maxResponseBytes` | `number \| undefined`                            | Optional | Maximum response body in bytes after decompression, default 8388608 (8 MiB); a streamed response counts all its chunks. A larger response fails with code response.                                                           |

## Signature

```ts
export interface OpenAIModelProviderOptions extends HttpModelOptions {
  readonly api?: "chat-completions" | "responses";
}
```

## Related contracts

- [HttpModelOptions](../support-httpmodeloptions/)
