---
title: "HttpModelOptions"
description: "HttpModelOptions — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name               | Type                  | Presence | Meaning                                                                                                                                                            |
| ------------------ | --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `baseUrl`          | `string`              | Required | Absolute HTTP(S) API base URL, including any /v1 prefix; excludes credentials, query and fragment. The selected protocol path is appended.                         |
| `apiKey`           | `string \| false`     | Required | Explicit bearer API key, or false for an unauthenticated endpoint. No environment variable or account login is read automatically.                                 |
| `timeoutMs`        | `number \| undefined` | Optional | Positive deadline in milliseconds; defaults to 120000 and cannot exceed 2147483647. It covers the whole request, or the silence between two chunks when streaming. |
| `maxResponseBytes` | `number \| undefined` | Optional | Positive maximum response body size in bytes after HTTP decompression; defaults to 8388608 (8 MiB). Oversized responses fail.                                      |

## Signature

```ts
export interface HttpModelOptions {
  readonly baseUrl: string;
  readonly apiKey: string | false;
  readonly timeoutMs?: number;
  readonly maxResponseBytes?: number;
}
```
