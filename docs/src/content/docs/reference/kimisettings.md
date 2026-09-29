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

| Name             | Type                                            | Presence | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------- | ----------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `region`         | `"mainland-cn" \| "global" \| undefined`        | Optional | Account deployment: "global" for kimi.ai (default) or "mainland-cn" for kimi.com. Selects the matching OAuth file, account endpoints and sandbox login region without copying the host configuration. Requires account authentication when authentication is supplied; usage forms reject an explicit region. Omission selects global for accounts and does not change API authentication. Conflicting declared account endpoints are rejected, including with the default region. |
| `authentication` | `AgentAuthentication \| undefined`              | Optional | Account authentication reads the OAuth file for the selected region and device_id from ~/.kimi-code or KIMI_CODE_HOME; account.file selects a dedicated profile directory. Usage forms accept KIMI_API_KEY or an explicit key/variable and require a model on agent(). Account key/variable forms are unsupported. Omission prepares no credentials.                                                                                                                               |
| `variables`      | `Readonly<Record<string, string>> \| undefined` | Optional | Explicit environment declarations; values are strings.                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `conversations`  | `ConversationStore \| undefined`                | Optional | Store that captures, locates and restores Kimi session bundles instead of the default native store, such as transportConversations("kimi", …). A store that declares another format is rejected when the harness is created.                                                                                                                                                                                                                                                       |

## Signature

```ts
export interface KimiSettings {
  readonly region?: "mainland-cn" | "global";
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly conversations?: ConversationStore;
}
```

## Related contracts

- [AgentAuthentication](../agentauthentication/)
- [ConversationStore](../conversationstore/)
- [Variables](../variables/)
