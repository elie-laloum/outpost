---
title: "HttpModelOptions"
description: "HttpModelOptions — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name               | Type                  | Presence | Meaning                                                                                                                                                                                                                       |
| ------------------ | --------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseUrl`          | `string`              | Required | Absolute HTTP(S) base URL including its version prefix, such as https://api.openai.com/v1; chat/completions or responses is appended. Credentials, query or fragment fail with code configuration, and redirects are refused. |
| `apiKey`           | `string \| false`     | Required | Explicit bearer API key, or false for an unauthenticated endpoint. No environment variable or account login is read automatically.                                                                                            |
| `timeoutMs`        | `number \| undefined` | Optional | Request deadline in milliseconds, default 120000, at most 2147483647. While streaming it restarts on each received chunk; expiry rejects with code timeout.                                                                   |
| `maxResponseBytes` | `number \| undefined` | Optional | Maximum response body in bytes after decompression, default 8388608 (8 MiB); a streamed response counts all its chunks. A larger response fails with code response.                                                           |

## Signature

```ts
export interface HttpModelOptions {
  readonly baseUrl: string;
  readonly apiKey: string | false;
  readonly timeoutMs?: number;
  readonly maxResponseBytes?: number;
}
```
