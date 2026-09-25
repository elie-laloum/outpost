---
title: "CodexSettings"
description: "CodexSettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CodexSettings } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                | Type                                            | Presence | Meaning                                                                                                                                      |
| ------------------- | ----------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelProvider`     | `CodexModelProvider \| undefined`               | Optional | Custom Codex model endpoint configuration; requires Responses API compatibility.                                                             |
| `approvalReviewer`  | `"user" \| "auto_review" \| undefined`          | Optional | Codex approval reviewer: the user or automatic approval review.                                                                              |
| `authentication`    | `AgentAuthentication \| undefined`              | Optional | Explicit authentication preparation for this CLI harness. Omission preserves already-configured access without discovering host credentials. |
| `variables`         | `Readonly<Record<string, string>> \| undefined` | Optional | Explicit environment declarations; values are strings.                                                                                       |
| `saveConversations` | `boolean \| undefined`                          | Optional | Enable native transcript capture when the adapter supports it.                                                                               |

## Signature

```ts
export interface CodexSettings extends CommonAgentSettings {
  readonly modelProvider?: CodexModelProvider;
  readonly approvalReviewer?: "user" | "auto_review";
}
```

## Related contracts

- [CodexModelProvider](../codexmodelprovider/)
- [CommonAgentSettings](../support-commonagentsettings/)
