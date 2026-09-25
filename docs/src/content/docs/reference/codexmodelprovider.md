---
title: "CodexModelProvider"
description: "CodexModelProvider — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CodexModelProvider } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                | Type                           | Presence | Meaning                                                                                                   |
| ------------------- | ------------------------------ | -------- | --------------------------------------------------------------------------------------------------------- |
| `baseUrl`           | `string`                       | Required | Base URL of the custom Responses-compatible model endpoint.                                               |
| `apiKeyEnvironment` | `string \| false \| undefined` | Optional | Environment variable containing the endpoint API key; false disables the API-key environment declaration. |

## Signature

```ts
export interface CodexModelProvider {
  readonly baseUrl: string;
  readonly apiKeyEnvironment?: string | false;
}
```
