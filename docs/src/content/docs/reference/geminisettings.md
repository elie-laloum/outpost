---
title: "GeminiSettings"
description: "GeminiSettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { GeminiSettings } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                                                        | Presence | Meaning                                                                                                                                      |
| ---------------- | ----------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`          | `string \| undefined`                                       | Optional | Native CLI model identifier; availability depends on the account.                                                                            |
| `authentication` | `AgentAuthentication \| undefined`                          | Optional | Explicit authentication preparation for this CLI harness. Omission preserves already-configured access without discovering host credentials. |
| `variables`      | `Readonly<Record<string, string>> \| undefined`             | Optional | Explicit environment declarations; values are strings.                                                                                       |
| `approvalMode`   | `"default" \| "plan" \| "auto_edit" \| "yolo" \| undefined` | Optional | Gemini CLI tool-approval mode.                                                                                                               |

## Signature

```ts
export interface GeminiSettings {
  readonly model?: string;
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly approvalMode?: "default" | "auto_edit" | "yolo" | "plan";
}
```

## Related contracts

- [AgentAuthentication](../agentauthentication/)
- [Variables](../variables/)
