---
title: "AgentAuthentication"
description: "AgentAuthentication — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { AgentAuthentication } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name          | Type                                    | Presence          | Meaning                                                                                                                                                                  |
| ------------- | --------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mode`        | `"api-key" \| "oauth-token" \| "login"` | Required          | Explicit credential mode: API key, Claude subscription token, or existing Codex login. Unsupported agent/mode combinations fail locally.                                 |
| `environment` | `string \| undefined`                   | Variant-dependent | Environment variable holding the API key. Codex can read a custom variable; Claude and Gemini require their standard ANTHROPIC_API_KEY and GEMINI_API_KEY names.         |
| `credentials` | `string \| undefined`                   | Variant-dependent | Explicit Codex auth.json contents to seed in the sandbox home. Omit only when a usable session already exists in that execution environment. No host file is discovered. |

## Signature

```ts
export type AgentAuthentication =
  | {
      readonly mode: "api-key";
      readonly environment?: string;
    }
  | {
      readonly mode: "oauth-token";
    }
  | {
      readonly mode: "login";
      readonly credentials?: string;
    };
```
