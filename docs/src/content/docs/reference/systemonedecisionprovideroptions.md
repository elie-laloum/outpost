---
title: "SystemOneDecisionProviderOptions"
description: "SystemOneDecisionProviderOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SystemOneDecisionProviderOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name               | Type                  | Presence | Meaning                                                                                                                            |
| ------------------ | --------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `baseUrl`          | `string`              | Required | HTTP(S) base URL including the version prefix, such as /v1; /systemone is appended. Credentials, query and fragment are forbidden. |
| `apiKey`           | `string \| false`     | Required | Explicit nonempty bearer key, or false for an unauthenticated endpoint.                                                            |
| `timeoutMs`        | `number \| undefined` | Optional | Request deadline including response reading, in positive integer milliseconds; defaults to 120000.                                 |
| `maxResponseBytes` | `number \| undefined` | Optional | Positive integer bound on response bytes; defaults to 8 MiB. Oversized responses fail with response.                               |

## Signature

```ts
export interface SystemOneDecisionProviderOptions {
  readonly baseUrl: string;
  readonly apiKey: string | false;
  readonly timeoutMs?: number;
  readonly maxResponseBytes?: number;
}
```
