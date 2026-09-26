---
title: "KimiSettings"
description: "KimiSettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { KimiSettings } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                                            | Presence | Meaning                                                                                                                                                                                                                                                                                          |
| ---------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `authentication` | `AgentAuthentication \| undefined`              | Optional | Explicit authentication for this CLI harness: "account", "usage", { account: { file \| key \| variable } } or { usage: { key \| variable } }. Unsupported forms fail when the agent is composed. Omission prepares nothing and keeps the access already configured in the execution environment. |
| `variables`      | `Readonly<Record<string, string>> \| undefined` | Optional | Explicit environment declarations; values are strings.                                                                                                                                                                                                                                           |

## Signature

```ts
export interface KimiSettings {
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
}
```

## Related contracts

- [AgentAuthentication](../agentauthentication/)
- [Variables](../variables/)
