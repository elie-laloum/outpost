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

| Name                | Type                           | Presence | Meaning                                                                                                                                                            |
| ------------------- | ------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `baseUrl`           | `string`                       | Required | Base URL of the Responses-compatible endpoint: absolute http or https, without credentials, query or fragment.                                                     |
| `apiKeyEnvironment` | `string \| false \| undefined` | Optional | Variable that holds the endpoint’s API key, default OPENAI_API_KEY; usage authentication fills it. false sends no key and leaves no authentication form available. |

## Signature

```ts
export interface CodexModelProvider {
  readonly baseUrl: string;
  readonly apiKeyEnvironment?: string | false;
}
```
