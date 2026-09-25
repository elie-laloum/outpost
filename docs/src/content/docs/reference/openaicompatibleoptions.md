---
title: "OpenAICompatibleOptions"
description: "OpenAICompatibleOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
This first phase makes text-only HTTP calls without Codex. The agent harness is planned for phase two: tool execution, repository editing and conversation persistence are not implemented. This API cannot be used as a dispatch agent or sandbox provider; its contract may change. See the [implemented scope and planned harness](../../guide/advanced/model-providers/).
:::

## Import

```ts
import type { OpenAICompatibleOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name               | Type                                             | Presence | Meaning                                                                                                                                    |
| ------------------ | ------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `baseUrl`          | `string`                                         | Required | Absolute HTTP(S) API base URL, including any /v1 prefix; excludes credentials, query and fragment. The selected protocol path is appended. |
| `model`            | `string`                                         | Required | Nonempty model identifier understood by the selected service; no default model is inferred.                                                |
| `apiKey`           | `string \| false`                                | Required | Explicit bearer API key, or false for an unauthenticated endpoint. No environment variable or account login is read automatically.         |
| `api`              | `"chat-completions" \| "responses" \| undefined` | Optional | HTTP protocol: chat-completions by default, or responses. No automatic protocol fallback.                                                  |
| `timeoutMs`        | `number \| undefined`                            | Optional | Positive request deadline in milliseconds, covering headers and the complete body; defaults to 120000 and cannot exceed 2147483647.        |
| `maxResponseBytes` | `number \| undefined`                            | Optional | Positive maximum response body size in bytes after HTTP decompression; defaults to 8388608 (8 MiB). Oversized responses fail.              |

## Signature

```ts
export interface OpenAICompatibleOptions {
  readonly baseUrl: string;
  readonly model: string;
  readonly apiKey: string | false;
  readonly api?: "chat-completions" | "responses";
  readonly timeoutMs?: number;
  readonly maxResponseBytes?: number;
}
```
