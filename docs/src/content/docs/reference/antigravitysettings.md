---
title: "AntigravitySettings"
description: "AntigravitySettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AntigravitySettings } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                                            | Presence | Meaning                                                                                                                                                                                                                                                                                          |
| ---------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `authentication` | `AgentAuthentication \| undefined`              | Optional | Explicit authentication for this CLI harness: "account", "usage", { account: { file \| key \| variable } } or { usage: { key \| variable } }. Unsupported forms fail when the agent is composed. Omission prepares nothing and keeps the access already configured in the execution environment. |
| `variables`      | `Readonly<Record<string, string>> \| undefined` | Optional | Explicit environment declarations; values are strings.                                                                                                                                                                                                                                           |
| `mode`           | `"accept-edits" \| "plan" \| undefined`         | Optional | Antigravity execution mode passed with --mode. Without it, headless runs pass --dangerously-skip-permissions; interactive sessions keep the CLI's approval prompts.                                                                                                                              |

## Signature

```ts
export interface AntigravitySettings {
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly mode?: "accept-edits" | "plan";
}
```

## Related contracts

- [AgentAuthentication](../agentauthentication/)
- [Variables](../variables/)
